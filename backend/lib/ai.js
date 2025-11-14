// backend/lib/ai.js
const axios = require('axios');

const AI = () => {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  const geminikey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const openaikey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  // --- Mock mode (for offline/local testing) ---
  const mockGenerate = async (payload) => ({
    summary: [
      `Summary point 1 about ${payload.topic}`,
      `Summary point 2 about ${payload.topic}`,
      `Summary point 3 about ${payload.topic}`,
    ],
    quiz: [
      { question: `What is ${payload.topic}?`, options: ['A', 'B', 'C', 'D'], answerIndex: 0 },
      { question: `Why is ${payload.topic} important?`, options: ['A', 'B', 'C', 'D'], answerIndex: 1 },
      { question: `Where is ${payload.topic} used?`, options: ['A', 'B', 'C', 'D'], answerIndex: 2 },
    ],
    tip: `Study ${payload.topic} for 25 minutes, then review your notes.`,
  });

  // --- Gemini API call with retry logic ---
  const callGemini = async (prompt, retries = 3) => {
    if (!geminikey) throw new Error('GEMINI_API_KEY not set');
    
    // Use v1 API endpoint (more stable) and ensure model name is correct
    const model = geminiModel;
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminikey}`;
    
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await axios.post(url, body, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000, // 30 second timeout
        });

        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          const finishReason = res.data?.candidates?.[0]?.finishReason;
          if (finishReason && finishReason !== 'STOP') {
            throw new Error(`Generation stopped: ${finishReason}`);
          }
          throw new Error('No response text from Gemini API');
        }
        return text;
      } catch (error) {
        const status = error.response?.status;
        
        // Handle 503 (Service Unavailable) with retry
        if (status === 503 && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.warn(`⚠️ Gemini API 503 (Service Unavailable). Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Handle 429 (Rate Limit) with retry
        if (status === 429 && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`⚠️ Gemini API rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If v1 fails with 404, try v1beta as fallback
        if (status === 404 && attempt === 0) {
          console.warn('⚠️ Trying v1beta endpoint as fallback...');
          const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminikey}`;
          try {
            const res = await axios.post(fallbackUrl, body, {
              headers: { 'Content-Type': 'application/json' },
              timeout: 30000,
            });
            const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
              throw new Error('No response text from Gemini API');
            }
            return text;
          } catch (fallbackError) {
            // If fallback also fails, continue with original error
            throw error;
          }
        }

        // If all retries exhausted or non-retryable error, throw
        throw error;
      }
    }
  };

  // --- OpenAI fallback (optional) ---
  const callOpenAI = async (prompt) => {
    if (!openaikey) throw new Error('OPENAI_API_KEY not set');
    const body = {
      model: openaiModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    };

    const res = await axios.post('https://api.openai.com/v1/chat/completions', body, {
      headers: {
        Authorization: `Bearer ${openaikey}`,
        'Content-Type': 'application/json',
      },
    });

    return res.data.choices[0].message.content;
  };

  // --- Build prompt ---
  const buildPrompt = (payload) => {
    const basePrompt = `You are an educational assistant. Create study materials for the topic: "${payload.topic}"

Context from Wikipedia:
${payload.wikiExtract}

Generate a JSON object with the following structure:
{
  "summary": ["point 1", "point 2", "point 3"],
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0
    }
  ],
  "tip": "A helpful study tip"
}`;

    if (payload.mode === 'math') {
      return basePrompt + `\n\nAlso include a "math" field:
  "math": {
    "question": "A math problem related to the topic",
    "answer": "The answer",
    "explanation": "Step-by-step explanation"
  }`;
    }

    return basePrompt + `\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.`;
  };

  // --- Main function ---
  const generateLesson = async (payload) => {
    const prompt = buildPrompt(payload);
    try {
      let text;

      if (provider === 'gemini') {
        console.log('🧠 Using Google Gemini...');
        text = await callGemini(prompt);
      } else if (provider === 'openai') {
        console.log('🧠 Using OpenAI...');
        text = await callOpenAI(prompt);
      } else {
        console.log('🧠 Using mock mode...');
        return await mockGenerate(payload);
      }

      // Try to parse JSON from model output
      // Remove markdown code blocks if present
      let cleanedText = text.trim();
      
      // Remove ```json or ``` markers
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      }
      
      // Find JSON object
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
        try {
          const parsed = JSON.parse(jsonText);
          // Validate structure
          if (parsed.summary && parsed.quiz && parsed.tip) {
            return parsed;
          } else {
            console.warn('⚠️ JSON missing required fields. Using parsed data with defaults.');
            return {
              summary: parsed.summary || [],
              quiz: parsed.quiz || [],
              tip: parsed.tip || 'Study the topic thoroughly.',
              ...(parsed.math && { math: parsed.math })
            };
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse JSON:', parseError.message);
          console.warn('⚠️ Raw response (first 200 chars):', cleanedText.substring(0, 200));
          return { summary: [], quiz: [], tip: cleanedText.substring(0, 200) };
        }
      } else {
        console.warn('⚠️ No JSON object found in response. Using raw text as tip.');
        return { summary: [], quiz: [], tip: cleanedText.substring(0, 200) };
      }
    } catch (err) {
      console.error(`❌ AI (${provider}) error:`, err.message);
      return mockGenerate(payload);
    }
  };

  return { generateLesson };
};

module.exports = AI;