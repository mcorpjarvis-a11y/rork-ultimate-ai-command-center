const express = require('express');
const router = express.Router();

/**
 * Ask/Reasoning Routes
 * Main AI reasoning route - connects to Gemini, Hugging Face, or OpenAI
 */

// Main reasoning endpoint
router.post('/', async (req, res) => {
  try {
    const { question, context, model, temperature, maxTokens } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Check available AI services
    const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const hfKey = process.env.EXPO_PUBLIC_HF_API_TOKEN || process.env.HUGGINGFACE_API_KEY;
    const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

    let response;
    let usedService;

    // Try Groq first (fastest free option)
    if (groqKey && (!model || model === 'groq')) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: context || 'You are JARVIS, a helpful AI assistant.' },
              { role: 'user', content: question }
            ],
            temperature: temperature || 0.7,
            max_tokens: maxTokens || 500
          })
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          response = data.choices[0].message.content;
          usedService = 'Groq';
        }
      } catch (error) {
        console.error('[Ask] Groq error:', error);
      }
    }

    // Try Gemini if Groq failed or not available
    if (!response && geminiKey && (!model || model === 'gemini')) {
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${context || 'You are JARVIS, a helpful AI assistant.'}\n\nUser: ${question}` }]
            }],
            generationConfig: {
              temperature: temperature || 0.7,
              maxOutputTokens: maxTokens || 500
            }
          })
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          response = data.candidates[0].content.parts[0].text;
          usedService = 'Gemini';
        }
      } catch (error) {
        console.error('[Ask] Gemini error:', error);
      }
    }

    // Try Hugging Face if others failed
    if (!response && hfKey && (!model || model === 'huggingface')) {
      try {
        const hfResponse = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: `${context || 'You are JARVIS, a helpful AI assistant.'}\n\nUser: ${question}\nAssistant:`,
            parameters: {
              max_new_tokens: maxTokens || 500,
              temperature: temperature || 0.7
            }
          })
        });

        if (hfResponse.ok) {
          const data = await hfResponse.json();
          response = data[0].generated_text.split('Assistant:')[1].trim();
          usedService = 'HuggingFace';
        }
      } catch (error) {
        console.error('[Ask] HuggingFace error:', error);
      }
    }

    if (response) {
      res.json({
        success: true,
        answer: response,
        service: usedService,
        model: model || 'auto'
      });
    } else {
      res.json({
        success: false,
        message: 'No AI service available. Please add API keys.',
        guidance: {
          services: [
            { name: 'Groq', env: 'EXPO_PUBLIC_GROQ_API_KEY', url: 'https://console.groq.com', tier: 'free' },
            { name: 'Gemini', env: 'EXPO_PUBLIC_GEMINI_API_KEY', url: 'https://makersuite.google.com', tier: 'free' },
            { name: 'HuggingFace', env: 'EXPO_PUBLIC_HF_API_TOKEN', url: 'https://huggingface.co/settings/tokens', tier: 'free' }
          ]
        }
      });
    }
  } catch (error) {
    console.error('[Ask] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available models
router.get('/models', (req, res) => {
  const models = [];
  
  if (process.env.EXPO_PUBLIC_GROQ_API_KEY) {
    models.push({ name: 'groq', displayName: 'Groq (Fast)', tier: 'free', available: true });
  }
  if (process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
    models.push({ name: 'gemini', displayName: 'Google Gemini', tier: 'free', available: true });
  }
  if (process.env.EXPO_PUBLIC_HF_API_TOKEN || process.env.HUGGINGFACE_API_KEY) {
    models.push({ name: 'huggingface', displayName: 'HuggingFace', tier: 'free', available: true });
  }
  if (process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY) {
    models.push({ name: 'openai', displayName: 'OpenAI GPT', tier: 'paid', available: true });
  }

  res.json({
    models,
    default: models.length > 0 ? models[0].name : null
  });
});

module.exports = router;
