/**
 * Function declarations for Gemini AI tools.
 * Note: google_search and code_execution are native Gemini built-in tools
 * added directly in fetchInference() — they do NOT go here.
 */

export const GEMINI_TOOLS = {
  function_declarations: [
    {
      name: "search_web",
      description: "Pesquisa na internet usando a API do Tavily. Retorna resumos e links dos resultados mais relevantes. Use sempre que precisar de informações em tempo real, atualizadas ou que não saiba.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "O termo ou pergunta a ser pesquisado" }
        },
        required: ["query"]
      }
    },
    {
      name: "read_url",
      description: "Lê e analisa o conteúdo completo de uma página web, PDF, JSON ou CSV. Suporta bypass de proteções como Cloudflare via Google. Use quando precisar extrair informações específicas de uma URL.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL completa a ser lida (incluindo https://)" },
          instruction: { type: "string", description: "O que extrair da página (ex: 'resuma o artigo', 'liste os preços', 'extraia a documentação')" }
        },
        required: ["url"]
      }
    },
    {
      name: "get_lol_player_stats",
      description: "Busca estatísticas de um jogador de League of Legends pela Riot API.",
      parameters: {
        type: "object",
        properties: {
          gameName: { type: "string", description: "Nome do invocador" },
          tagLine: { type: "string", description: "Tag do invocador (ex: BR1)" }
        },
        required: ["gameName", "tagLine"]
      }
    },
    {
      name: "complete_task",
      description: "OBRIGATÓRIO: Finaliza o turno e entrega a resposta final ao usuário. Sempre chame ao final — o campo 'answer' é o que o usuário vê.",
      parameters: {
        type: "object",
        properties: {
          answer: { type: "string", description: "Resposta final completa para o usuário" }
        }
      }
    },
    {
      name: "send_message",
      description: "Envia mensagem intermediária ao chat SOMENTE durante execução de múltiplas tools em sequência (ex: 'Buscando dados...', 'Analisando a tela...'). NUNCA use para a resposta final — a resposta final deve vir no campo 'answer' do 'complete_task'.",
      parameters: {
        type: "object",
        properties: { text: { type: "string", description: "Mensagem intermediária de status" } },
        required: ["text"]
      }
    },
    {
      name: "notify",
      description: "Mostra uma notificação do sistema, mesmo com a janela fechada. Use para alertas de tarefas agendadas ou conclusão de processos em background.",
      parameters: {
        type: "object",
        properties: { text: { type: "string", description: "Texto da notificação" } },
        required: ["text"]
      }
    },
    {
      name: "show_chat",
      description: "Abre/expande a janela de chat quando ela estiver minimizada.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "get_open_windows",
      description: "Lista todas as janelas e telas abertas disponíveis para captura. Use antes de 'capture_screen' para obter o source_id correto.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "capture_screen",
      description: "Captura uma screenshot de uma janela ou tela específica para análise visual. Requer source_id obtido via 'get_open_windows'.",
      parameters: {
        type: "object",
        properties: {
          source_id: { type: "string", description: "ID da fonte obtido de 'get_open_windows'" }
        },
        required: ["source_id"]
      }
    },
    {
      name: "schedule_task",
      description: "Agenda uma ação para ser executada em um horário futuro. Sempre confirme o agendamento ao usuário.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string", description: "Descrição da tarefa a executar" },
          time: { type: "string", description: "Horário no formato HH:mm (ex: '14:30')" }
        },
        required: ["description", "time"]
      }
    },
    {
      name: "list_tasks",
      description: "Lista todas as tarefas agendadas pendentes.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "delete_task",
      description: "Remove uma tarefa agendada pelo seu ID.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "ID da tarefa a remover" } },
        required: ["id"]
      }
    },
    {
      name: "save_skill",
      description: "Salva um workflow bem-sucedido como Skill reutilizável. Use após completar tarefas complexas (5+ tool calls) ou quando resolver um problema com sucesso.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Identificador único da skill (kebab-case, ex: 'web-research')" },
          description: { type: "string", description: "Descrição de quando usar esta skill" },
          procedure: { type: "string", description: "Passos completos em Markdown descrevendo o procedimento, ferramentas a usar e erros a evitar." }
        },
        required: ["name", "description", "procedure"]
      }
    },
    {
      name: "list_skills",
      description: "Lista todas as skills disponíveis (nível L1: catálogo). Use antes de iniciar uma tarefa complexa para ver se já existe uma skill.",
      parameters: { type: "object", properties: {} }
    },
    {
      name: "load_skill",
      description: "Carrega o procedimento completo de uma skill (nível L3). Use para aprender os passos antes de executar a tarefa.",
      parameters: {
        type: "object",
        properties: { name: { type: "string", description: "Nome da skill a carregar" } },
        required: ["name"]
      }
    }
  ]
};
