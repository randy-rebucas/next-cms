import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { checkPin } from "@/core/auth";

async function getSetting(key: string): Promise<string> {
  await connectDB();
  const row = await Setting.findOne({ key }).lean() as { value?: string } | null;
  return row?.value ?? "";
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const apiKey = (await getSetting("openaiApiKey")) || process.env.OPENAI_API_KEY || "";
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

  const systemPrompt = systemPrompts[type as string] || systemPrompts.post;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt || `Write about: ${title}` },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: (errBody as { error?: { message?: string } }).error?.message || "OpenAI API error" },
      { status: response.status }
    );
  }

  const data = await response.json() as { choices: { message: { content: string } }[] };
  return NextResponse.json({ content: data.choices[0].message.content });
}
