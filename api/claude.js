export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug: Check if API key exists
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔑 API Key starts with:', apiKey ? apiKey.substring(0, 15) + '...' : 'MISSING');

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is not set!');
    return res.status(500).json({ 
      error: 'Server configuration error: API key not set',
      debug: 'ANTHROPIC_API_KEY environment variable is missing'
    });
  }

  try {
    const { model, max_tokens, messages } = req.body;

    console.log('📤 Sending request to Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': "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",
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages
      })
    });

    console.log('📥 Anthropic API response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Anthropic API error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Anthropic API error',
        details: data
      });
    }

    console.log('✅ Success!');
    return res.status(200).json(data);

  } catch (error) {
    console.error('💥 Server error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
