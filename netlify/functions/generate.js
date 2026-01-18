
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    // Load environment variables (Set these in Netlify Dashboard)
    const apiKey = process.env.AI_API_KEY;
    const baseURL = process.env.AI_BASE_URL || "https://api.deepseek.com"; // Default to DeepSeek
    const model = process.env.AI_MODEL || "deepseek-chat";

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Server Configuration Error: API Key missing" }) };
    }

    // Call OpenAI-compatible API
    const response = await fetch(`${baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        stream: false,
        // Force JSON format if supported by the provider (DeepSeek supports this)
        response_format: { type: "json_object" } 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error:", errorText);
      return { statusCode: response.status, body: JSON.stringify({ error: `AI Provider Error: ${response.statusText}` }) };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, content: content }),
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
