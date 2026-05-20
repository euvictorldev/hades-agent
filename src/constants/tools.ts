/**
 * Function declarations for Gemini AI tools.
 * Note: google_search and code_execution are native Gemini built-in tools
 * added directly in fetchInference() — they do NOT go here.
 */

export const GEMINI_TOOLS = {
  function_declarations: [
    {
      name: "search_web",
      description: "Pesquisa na web via Tavily.",
      parameters: { type: "object", properties: { query: { type: "string", description: "Termo" } }, required: ["query"] }
    },
    {
      name: "read_url",
      description: "Lê página web, PDF, JSON ou CSV.",
      parameters: { type: "object", properties: { url: { type: "string", description: "URL" }, instruction: { type: "string", description: "O que extrair" } }, required: ["url"] }
    },
    {
      name: "complete_task",
      description: "Finaliza o turno com resposta final.",
      parameters: { type: "object", properties: { answer: { type: "string", description: "Resposta" } } }
    },
    {
      name: "send_message",
      description: "Envia mensagem intermediária ao chat.",
      parameters: { type: "object", properties: { text: { type: "string", description: "Texto" } }, required: ["text"] }
    },
    {
      name: "notify",
      description: "Notificação nativa do SO.",
      parameters: { type: "object", properties: { text: { type: "string", description: "Texto" } }, required: ["text"] }
    },
    {
      name: "show_chat",
      description: "Abre a janela de chat.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "get_open_windows",
      description: "Lista janelas abertas para captura.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "capture_screen",
      description: "Captura tela (requer source_id).",
      parameters: { type: "object", properties: { source_id: { type: "string", description: "ID" } }, required: ["source_id"] }
    },
    {
      name: "schedule_task",
      description: "Agenda uma ação futura.",
      parameters: { type: "object", properties: { description: { type: "string", description: "Tarefa" }, time: { type: "string", description: "HH:mm" } }, required: ["description", "time"] }
    },
    {
      name: "list_tasks",
      description: "Lista tarefas agendadas pendentes.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "delete_task",
      description: "Remove tarefa agendada pelo ID.",
      parameters: { type: "object", properties: { id: { type: "string", description: "ID" } }, required: ["id"] }
    },
    {
      name: "save_skill",
      description: "Salva workflow como skill.",
      parameters: { type: "object", properties: { name: { type: "string", description: "Nome" }, description: { type: "string", description: "Resumo" }, procedure: { type: "string", description: "Passos markdown" } }, required: ["name", "description", "procedure"] }
    },
    {
      name: "list_skills",
      description: "Lista catálogo de skills disponíveis.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "load_skill",
      description: "Carrega passos de uma skill.",
      parameters: { type: "object", properties: { name: { type: "string", description: "Nome" } }, required: ["name"] }
    }
  ]
};

