/**
 * Secure Gemini API Client
 * 
 * All requests are routed through /api/ai which is proxied via Vite (dev) 
 * or a serverless function (prod). This ensures the API key is never 
 * exposed in the client-side bundle.
 */

export async function generateContent(prompt: string, model: string = 'gemini-1.5-flash') {
    try {
        const response = await fetch(`/api/ai/models/${model}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`AI Request failed: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('AI response format invalid or empty');
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

/**
 * Example usage:
 * const result = await generateContent("Analyze this text: 'I am feeling overwhelmed today'");
 */
