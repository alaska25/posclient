const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SUPPORT_SYSTEM_PROMPT = `You are a friendly and knowledgeable support assistant for FlowPOS, a professional multi-service platform in the Philippines that connects homeowners and businesses with certified technicians.

Services offered: Electrical Repairs (from ₱800), Plumbing Services (from ₱600), HVAC & Aircon (from ₱1,200), Appliance Repair (from ₱500), Home Renovation (from ₱2,000), Security Systems (from ₱3,500).

Pricing plans:
- Basic: ₱499/visit — 1 technician visit, diagnostic included, 7-day warranty, email support
- Standard: ₱1,299/month — 3 visits, priority scheduling, 30-day warranty, phone & email support, free follow-up
- Premium: ₱2,999/month — unlimited visits, 24/7 emergency support, 90-day warranty, dedicated technician, monthly report, free parts on minor repairs

Key facts: 5,000+ jobs completed, 98% satisfaction rate, 150+ technicians, 24/7 support, licensed & insured, transparent pricing, on-time guarantee, serves the Philippines.

Keep answers concise, warm, and helpful. If someone wants to book, direct them to fill out the contact form on the page. If asked something outside FlowPOS scope, politely say you can only help with FlowPOS-related questions.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'messages array is required' }),
      };
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SUPPORT_SYSTEM_PROMPT },
        ...messages,
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };

  } catch (err) {
    console.error('Groq support error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI error', detail: err.message }),
    };
  }
};