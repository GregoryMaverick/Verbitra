import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

function getDefaultModelName(): string {
  const model = process.env.GEMINI_MODEL;
  return model && model.trim().length > 0 ? model : DEFAULT_GEMINI_MODEL;
}

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

export function getModel(modelName = getDefaultModelName()): GenerativeModel {
  return getClient().getGenerativeModel({ model: modelName });
}

export async function generateText(
  prompt: string,
  systemInstruction?: string,
  modelName = getDefaultModelName(),
): Promise<string> {
  try {
    const model = getClient().getGenerativeModel({
      model: modelName,
      ...(systemInstruction ? { systemInstruction } : {}),
    });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    throw new Error(`Gemini request failed (model="${modelName}"): ${details}`);
  }
}
