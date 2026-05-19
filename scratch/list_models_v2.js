const { GoogleGenAI } = require('@google/genai');

async function listModels() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API Key found');
    return;
  }

  const genAI = new GoogleGenAI({ apiKey });
  try {
    // Note: The SDK v2 might have a different way to list models
    // In SDK v2, it's often ai.models.list()
    const result = await genAI.models.list();
    console.log('Available Models:');
    if (result.models) {
      result.models.forEach(m => {
        console.log(`- ${m.name} (Supported actions: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log('No models found in result:', result);
    }
  } catch (err) {
    console.error('Error listing models:', err);
  }
}

listModels();
