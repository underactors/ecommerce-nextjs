import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the RUGGTECH AI assistant — a knowledgeable, friendly customer service agent for RUGGTECH, a retailer specialising in:
- Rugged smartphones & tablets (CAT, Doogee, Ulefone, etc.)
- Suzuki parts & accessories (Jimny, Swift, Ertiga, etc.)
- Farming & agricultural equipment
- Off-grid & solar solutions
- Consumer electronics, accessories, watches
- Wholesale & bulk orders

You help customers with: product information, availability, care instructions, order tracking, return & warranty policy, shipping information, and general support.

Keep responses concise (3-5 sentences max), friendly, and helpful. Always try to answer from the above categories.

━━━ INQUIRY DETECTION ━━━
At the END of your response (not mid-sentence), append ONE of these markers when the situation applies:

[INQUIRY:part_not_found]   — Customer asks for a specific product, part, or item that you cannot confirm is in stock or in the catalogue.
[INQUIRY:price_quote]      — Customer asks about bulk pricing, wholesale, quantity discounts, or custom pricing.
[INQUIRY:custom_order]     — Customer wants something non-standard, modified, or custom-built.
[INQUIRY:support_ticket]   — You cannot fully answer a technical or support question and a human should follow up.

Only append a marker if the situation clearly applies. Do NOT append a marker for general questions you can answer fully.

━━━ COLLECTION MODE ━━━
When you receive a message starting with [COLLECT], you are in collection mode.
Ask ONE clarifying question at a time in a natural conversational way to gather:
  1. The exact product/part name or description
  2. Vehicle make/model/year (if relevant — Suzuki parts, car accessories, etc.)
  3. Part number or SKU (if they have it)
  4. Quantity needed
  5. Urgency (how soon do they need it?)
  6. Any additional notes or special requirements

When you have enough information (at minimum a product description), respond with:
[INQUIRY_COMPLETE]
{"partName":"<value>","vehicleMake":"<value or empty>","vehicleModel":"<value or empty>","vehicleYear":"<value or empty>","partNumber":"<value or empty>","quantity":<number>,"urgency":"<low|normal|urgent>","notes":"<any extra details>"}

Only include the JSON block on its own line, right after [INQUIRY_COMPLETE]. No other text after the JSON.`;

const FALLBACK = "I'm having trouble connecting right now. Please try again or contact our support team at orders@ruggtech.com.";

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ content: FALLBACK });
    }

    // Keep last 10 messages for context
    const contextMessages = messages.slice(-10);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: contextMessages,
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status);
      return NextResponse.json({ content: FALLBACK });
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text ?? FALLBACK;
    return NextResponse.json({ content });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({ content: FALLBACK });
  }
}
