"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function generateCourse({ article }: { article: string }) {
  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    system: "You are a professional writer. " + "You write simple, clear, and concise content.",
    prompt: `Provide a course about: ${article}`,
  });

  return text;
}
