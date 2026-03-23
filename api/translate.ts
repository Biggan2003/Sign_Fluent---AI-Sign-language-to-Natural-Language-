import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // শুধু POST request allow করবো
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gestures, language } = req.body;

  try {
    // API key এখানে safe! browser এ visible না!
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY, // 🔒 Hidden!
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate these sign language gestures to ${language}. 
                         Gesture data: ${JSON.stringify(gestures)}. 
                         Return only the translated sentence. 
                         If unclear, return "Unrecognized gesture."`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Translation failed';
    
    res.status(200).json({ text: translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
}
