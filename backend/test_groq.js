require('dotenv').config();
const Groq = require('groq-sdk');
const g = new Groq({ apiKey: process.env.GROQ_API_KEY });
g.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: 'You are an ATS optimization expert. Return JSON with optimizations array. IMPORTANT: Respond ONLY with valid JSON.' },
    { role: 'user', content: 'Resume: Software developer with React and Node.js skills.\n\nJob Description: Looking for Senior Engineer with React, TypeScript, AWS, Docker.' }
  ],
  max_tokens: 2048,
  temperature: 0.5,
  response_format: { type: 'json_object' }
}).then(r => console.log('SUCCESS:', r.choices[0].message.content.substring(0, 500)))
  .catch(e => console.log('ERROR:', e.status, e.message.substring(0, 300)));
