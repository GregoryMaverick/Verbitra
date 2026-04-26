import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

let _client: GoogleGenerativeAI | null = null;

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

export function getModel(modelName = "gemini-2.5-flash"): GenerativeModel {
  return getClient().getGenerativeModel({ model: modelName });
}

export async function generateText(
  prompt: string,
  systemInstruction?: string,
  modelName = "gemini-2.5-flash",
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: modelName,
    ...(systemInstruction ? { systemInstruction } : {}),
  });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
