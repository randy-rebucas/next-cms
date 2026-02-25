import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { checkPin } from "@/lib/api";

function getSetting(key: string): string {
  const row = db.prepare("SELECT value FROM settings WHERE key=?").get(key) as { value: string } | undefined;
  return row?.value ?? "";
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;

  const apiKey = getSetting("openaiApiKey") || process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "No OpenAI API key configured. Add it in Admin → Settings → OpenAI API Key." },
      { status: 400 }
    );
  }

  const { title, prompt, type = "post" } = await req.json();

  const systemPrompts: Record<string, string> = {
    post: `You are a legal content writer for an anti-corruption Filipino lawyer named Atty. Levito "Levi" Baligod. Write informative, accessible blog posts about Philippine law, anti-corruption topics, and legal rights. Output clean HTML using only: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>. No wrapping <html> or <body> tags.`,
    excerpt: `Write a 1-2 sentence excerpt for a Philippine law blog post. Return plain text only, no HTML.`,
    faq_answer: `You are a Filipino anti-corruption lawyer. Write a clear, helpful answer to a legal FAQ. Use plain text, no HTML.`,
  };

  const userContent =
    type === "excerpt"
      ? `Post title: "${title}". Write a compelling excerpt.`
      : type === "faq_answer"
      ? `FAQ question: "${prompt || title}". Write a clear answer based on Philippine law.`
      : `Write a full blog post titled: "${title}". ${prompt ? `Additional context: ${prompt}` : ""}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompts[type] ?? systemPrompts.post },
          { role: "user", content: userContent },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as { error?: { message?: string } };
      return NextResponse.json(
        { error: errBody?.error?.message ?? `OpenAI error ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
