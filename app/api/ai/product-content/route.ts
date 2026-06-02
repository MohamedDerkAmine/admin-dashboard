import { NextResponse } from "next/server";

import { getGeminiClient } from "@/lib/ai/gemini";
import { buildProductContentPrompt } from "@/lib/ai/product-content-prompt";
import {
  ProductAiValidationError,
  validateGeneratedProductContent,
  validateProductAiInput,
} from "@/lib/validators/product-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = validateProductAiInput(body);
    const ai = getGeminiClient();
    const prompt = buildProductContentPrompt(input);

    const response = await ai.models.generateContent({
      contents: prompt,
      model: "gemini-2.5-flash",
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 500 },
      );
    }

    const parsed = parseJsonResponse(text);
    const data = validateGeneratedProductContent(parsed);

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ProductAiValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      console.error("Gemini product content JSON parse failed:", error);
      return NextResponse.json(
        { error: "AI returned an invalid format. Please retry." },
        { status: 500 },
      );
    }

    if (error instanceof Error && error.message === "Missing GEMINI_API_KEY") {
      console.error("Gemini product content route misconfigured:", error);
      return NextResponse.json(
        { error: "AI content generation is not configured." },
        { status: 500 },
      );
    }

    console.error("Gemini product content generation failed:", error);
    return NextResponse.json(
      { error: "Could not generate content. Please try again." },
      { status: 500 },
    );
  }
}

function parseJsonResponse(text: string) {
  return JSON.parse(stripCodeFence(text));
}

function stripCodeFence(text: string) {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}
