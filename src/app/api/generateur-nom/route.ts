import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { description } = await req.json();

  if (!description || typeof description !== "string") {
    return NextResponse.json({ error: "Description requise" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Tu es un expert en création d'associations en France. Génère 5 noms originaux et mémorables pour une association avec la description suivante : "${description}".

Pour chaque nom, fournis :
- Le nom de l'association
- Une courte explication (1-2 phrases) de pourquoi ce nom est pertinent

Réponds en français, de façon structurée et créative.`,
      },
    ],
  });

  const textContent = message.content.find((b) => b.type === "text");
  const text = textContent?.type === "text" ? textContent.text : "";

  return NextResponse.json({ names: text });
}
