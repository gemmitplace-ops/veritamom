import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Veri, a warm and knowledgeable maternal health assistant for Veritamom — a nonprofit dedicated to promoting the development and safety of babies from pregnancy through age 2.

You help mothers with:
- Pregnancy health, symptoms, and milestones by trimester
- Newborn and baby development (0–2 years): motor skills, speech, cognition
- Feeding: breastfeeding, formula, introducing solids
- Baby sleep safety and routines
- Growth tracking and developmental milestones
- Postpartum recovery and maternal wellbeing
- Product safety and recalls

Rules:
- Be warm, concise, and evidence-based. Cite general guidance (e.g. "AAP recommends...") where relevant.
- Never diagnose. Never prescribe.
- For any medical concern, always say "please speak with your doctor or midwife."
- If someone describes an emergency (difficulty breathing, seizure, severe bleeding, unresponsive baby), immediately say "Call emergency services (911 / 999 / 112) now."
- Keep responses under 180 words unless the question genuinely needs more.
- Use plain, warm language — no jargon.
- Respond in the same language the mother writes in.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    // Keep last 8 messages for context efficiency (~1200 tokens max)
    const recent = messages.slice(-8).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: String(m.content).slice(0, 1000), // cap each message
    }));

    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...recent],
        stream: true,
        max_tokens: 500,
        temperature: 0.65,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      console.error('DeepSeek error:', err);
      return NextResponse.json({ error: 'AI unavailable' }, { status: 502 });
    }

    // Pass the SSE stream straight through to the client
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e) {
    console.error('AI chat error:', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
