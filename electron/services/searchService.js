const axios = require('axios');

class SearchService {
    async searchWeb(query) {
        try {
            // O usuário precisa adicionar essa chave no arquivo .env
            const apiKey = process.env.VITE_TAVILY_API_KEY; 
            
            if (!apiKey) {
                return "Erro: A chave da API do Tavily (VITE_TAVILY_API_KEY) não está configurada no arquivo .env. Por favor, adicione-a para realizar pesquisas.";
            }

            console.log(`[SearchService] Buscando via Tavily: ${query}`);
            
            const response = await axios.post('https://api.tavily.com/search', {
                api_key: apiKey,
                query: query,
                search_depth: "basic",
                include_answer: true,
                max_results: 5,
            });

            if (response.data && response.data.results) {
                const resultsText = response.data.results
                    .map(r => `[${r.title}](${r.url})\n${r.content}`)
                    .join('\n\n');
                
                const answer = response.data.answer ? `\nResumo da Web: ${response.data.answer}\n\n` : '';
                return `${answer}Resultados Encontrados:\n${resultsText}`;
            }

            return "Nenhum resultado encontrado.";
        } catch (error) {
            console.error("[SearchService] Erro na busca Tavily:", error.message);
            return `Erro ao buscar na web via Tavily: ${error.response?.data?.error || error.message}`;
        }
    }
}

module.exports = new SearchService();
