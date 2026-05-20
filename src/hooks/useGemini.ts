import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { buildHadesContext, getHadesSystemPrompt } from '../constants/prompts';
import { GEMINI_TOOLS } from '../constants/tools';
import { electronService } from '../services/electron';
import { prepareGeminiPayload, processGeminiParts } from '../utils/ai';
import { mapModelIdToApiName } from '../constants/models';

/**
 * Hook to manage Gemini AI inference and tool execution.
 * Handles the conversational Hades agent, tool calls, and state management.
 *
 * Architecture:
 * - Main loop uses native google_search + code_execution (built-in Gemini tools)
 * - read_url uses a SEPARATE Gemini request with url_context (incompatible with function_declarations)
 * - web_search (Tavily) has been removed — replaced by native google_search
 */
export const useGemini = (
  currentModel: string,
  addMessage: (text: string, sender: 'user' | 'ia', image?: string) => ChatMessage[]
) => {
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  /**
   * Reads a URL by making a SEPARATE Gemini request using the native url_context tool.
   * This is necessary because url_context is incompatible with function_declarations
   * in the same request. Benefits over manual scraping: Cloudflare bypass, PDF support,
   * structured extraction, up to 20 URLs / 34MB per call.
   */
  const fetchWithUrlContext = useCallback(async (url: string, instruction?: string): Promise<string> => {
    const settings = await electronService.getSettings();
    const apiKey = settings?.general?.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    const apiModel = mapModelIdToApiName(currentModel);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;
    const prompt = instruction
      ? `${instruction}\n\nURL: ${url}`
      : `Leia e extraia o conteúdo principal desta URL de forma estruturada: ${url}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          tools: [{ url_context: {} }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
        })
      });

      if (!response.ok) {
        return `Erro ao acessar URL (HTTP ${response.status}).`;
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text
        || 'Não foi possível extrair o conteúdo da URL.';
    } catch (err) {
      console.error('[useGemini] fetchWithUrlContext error:', err);
      return 'Erro ao ler a URL.';
    }
  }, [currentModel]);

  /**
   * Executes a tool requested by the AI.
   */
  const executeTool = useCallback(async (name: string, args: any, currentContents: any[]) => {
    setActiveTool(name);

    try {
      switch (name) {
        case "get_open_windows":
          return await electronService.getSources();

        case "capture_screen": {
          const base64 = await electronService.captureSource(args.source_id);
          currentContents.push({
            role: 'user',
            parts: [
              { text: `CONTEXTO VISUAL DA TELA (${args.source_id}):` },
              { inline_data: { mime_type: "image/png", data: base64.split(',')[1] } }
            ]
          });
          return { status: "success", info: "Imagem capturada com sucesso." };
        }
        
        case "search_web":
          return await electronService.searchWeb(args.query);

        case "read_url":
          // Uses a separate Gemini request with native url_context (bypass Cloudflare, PDF support)
          return await fetchWithUrlContext(args.url, args.instruction);

        case "schedule_task":
          return await electronService.scheduleTask(args);

        case "list_tasks":
          return await electronService.getTasks();

        case "delete_task":
          return await electronService.deleteTask(args.id);

        case "save_skill":
          return await electronService.saveSkill(args);

        case "list_skills":
          return await electronService.listSkills();

        case "load_skill":
          return await electronService.loadSkill(args.name);


        case "complete_task":
          return args.answer || "Tarefa finalizada.";

        case "send_message":
          addMessage(args.text, 'ia');
          return "Mensagem enviada ao chat.";

        case "show_chat":
          electronService.showChat();
          return "Janela de chat aberta.";

        case "notify":
          electronService.showNotification(args.text);
          return "Notificação enviada.";

        default:
          return "Ferramenta não encontrada.";
      }
    } catch (err) {
      console.error(`[useGemini] Error executing tool ${name}:`, err);
      return `Erro ao executar ${name}.`;
    }
  }, [addMessage, fetchWithUrlContext]);

  /**
   * Performs a single fetch request to the Gemini API.
   * Native tools enabled: google_search (replaces Tavily), code_execution (new).
   */
  const fetchInference = async (url: string, contents: any[], toolsToInject: any) => {
    const payload = {
      contents,
      tools: [
        toolsToInject              // custom function_declarations
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
    };

    console.groupCollapsed("🤖 [Gemini API] Request Payload");
    console.log("URL:", url);
    console.log("System Prompt / Contents:", JSON.stringify(contents, null, 2));
    console.log("Tools injected:", JSON.stringify(payload.tools, null, 2));
    console.log("Full Payload size:", JSON.stringify(payload).length, "bytes");
    console.groupEnd();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 429) {
      console.warn("🤖 [Gemini API] 429 RATE LIMIT REACHED");
      return { error: "LIMIT" };
    }
    const data = await response.json();
    
    console.groupCollapsed("🤖 [Gemini API] Response Data");
    console.log("Response JSON:", JSON.stringify(data, null, 2));
    console.log("Total Tokens used:", data.usageMetadata?.totalTokenCount);
    console.log("Prompt tokens:", data.usageMetadata?.promptTokenCount);
    console.log("Candidates tokens:", data.usageMetadata?.candidatesTokenCount);
    console.groupEnd();

    if (data.error && typeof data.error === 'object') {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }
    return data;
  };

  /**
   * Main ReAct loop: execute tools autonomously before responding.
   */
  const runReactLoop = async (url: string, contents: any[], toolsToInject: any) => {
    let callCount = 0;
    let aiText = "";
    let hasFinalAnswer = false;
    let hasUsedSendMessage = false;
    let totalTokens = 0;
    const toolCallsLog: any[] = [];

    while (callCount < 20 && !hasFinalAnswer) {
      const data = await fetchInference(url, contents, toolsToInject);
      if (data.error === "LIMIT") {
        aiText = "⚠️ LIMITE DE REQUISIÇÕES ATINGIDO.";
        break;
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const { textContent, functionCalls } = processGeminiParts(parts);
      if (textContent) aiText = textContent;

      if (data.usageMetadata?.totalTokenCount) {
        const count = data.usageMetadata.totalTokenCount;
        totalTokens += count;
        await electronService.updateTokens(count);
      }

      if (functionCalls.length === 0) {
        hasFinalAnswer = true;
        continue;
      }

      contents.push(data.candidates[0].content);

      const toolResults = await Promise.all(functionCalls.map(async (fc) => {
        const { name, args } = fc;
        if (name === "complete_task") {
          aiText = args.answer || "";
          hasFinalAnswer = true;
          return { functionResponse: { name, response: { content: "OK" } } };
        }
        if (name === "send_message") {
          hasUsedSendMessage = true;
        }
        const start = Date.now();
        const result = await executeTool(name, args, contents);
        const duration = Date.now() - start;
        
        toolCallsLog.push({
          name,
          args,
          result: typeof result === 'string' ? result.substring(0, 500) : result,
          success: !String(result).startsWith("Erro"),
          duration_ms: duration
        });
        
        return { functionResponse: { name, response: { content: result } } };
      }));

      contents.push({ role: 'function', parts: toolResults as any });
      callCount++;
    }

    return { aiText, hasUsedSendMessage, totalTokens, toolCallsLog };
  };

  /**
   * Main entry point for AI inference.
   * Builds enriched context (date, time, timezone, etc.) and runs the ReAct loop.
   */
  const handleAIResponse = useCallback(async (userMsgText: string, currentHistory: ChatMessage[]): Promise<number> => {
    setIsThinking(true);

    try {
      const settings = await electronService.getSettings();
      const apiKey = settings?.general?.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key não configurada.");

      // Fetch dynamic context
      const skillsResp = await electronService.listSkills();
      const activeSkills = skillsResp && Array.isArray(skillsResp) && skillsResp.length > 0 
          ? `[${skillsResp.map((s: any) => s.name).join(', ')}]` 
          : 'Nenhuma skill disponível.';
      
      const learnings = await electronService.getLearnings();

      // Build rich context for system prompt (Phases 1, 2, 4, 5)
      const ctx = buildHadesContext(activeSkills, learnings);
      const systemPrompt = getHadesSystemPrompt(ctx);

      console.groupCollapsed("🧠 [Hades Context] Generation");
      console.log("Active Skills Length (chars):", activeSkills.length);
      console.log("Learnings Length (chars):", learnings ? JSON.stringify(learnings).length : 0);
      console.log("System Prompt Length (chars):", systemPrompt.length);
      console.log("System Prompt Preview:", systemPrompt.substring(0, 500) + "...");
      console.groupEnd();

      // --- Lightweight Intent Router (Phase 4) ---
      const msgLower = userMsgText.toLowerCase();
      const needsWeb = /(pesquis|busc|not[íi]cia|google|site|web|link|url|resum|leia|youtube)/i.test(msgLower);
      const needsSystem = /(tira|captur|tela|agend|lembr|taref|chat|notific|skill|mem[óo]ria)/i.test(msgLower);

      let filteredTools = GEMINI_TOOLS.function_declarations.filter(t => t.name === 'complete_task' || t.name === 'send_message');

      if (needsWeb) {
        filteredTools.push(...GEMINI_TOOLS.function_declarations.filter(t => ['search_web', 'read_url'].includes(t.name)));
      }
      if (needsSystem) {
        filteredTools.push(...GEMINI_TOOLS.function_declarations.filter(t => 
          ['capture_screen', 'get_open_windows', 'schedule_task', 'list_tasks', 'delete_task', 'notify', 'show_chat'].includes(t.name)
        ));
      }
      
      if (!needsWeb && !needsSystem && msgLower.length > 60) {
        filteredTools = GEMINI_TOOLS.function_declarations;
      }

      const toolsToInject = { function_declarations: filteredTools };
      // ------------------------------------------

      const apiModel = mapModelIdToApiName(currentModel);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`;
      const contents = prepareGeminiPayload(systemPrompt, currentHistory);

      if (userMsgText && !currentHistory.some(m => m.text === userMsgText)) {
        contents.push({ role: 'user', parts: [{ text: userMsgText }] });
      }

      const { aiText, hasUsedSendMessage, totalTokens, toolCallsLog } = await runReactLoop(url, contents, toolsToInject);

      if (aiText && !hasUsedSendMessage) {
        addMessage(aiText, 'ia');
      }

      // Log Session for Dreaming (Phase 5)
      try {
        await electronService.logSession({
          timestamp: new Date().toISOString(),
          messages: [...currentHistory, { text: userMsgText, role: 'user' }, { text: aiText, role: 'ia' }],
          toolCalls: toolCallsLog,
          totalTokens,
          skillsUsed: toolCallsLog.filter(t => t.name === 'load_skill').map(t => t.args.name)
        });
      } catch (logErr) {
        console.error("Erro ao fazer log da sessão", logErr);
      }

      return totalTokens;

    } catch (error: any) {
      console.error("[useGemini] Inference error:", error);
      addMessage(`Erro: ${error.message}`, 'ia');
      return 0;
    } finally {
      setIsThinking(false);
      setActiveTool(null);
    }
  }, [currentModel, addMessage, executeTool]);

  return {
    isThinking,
    activeTool,
    handleAIResponse
  };
};
