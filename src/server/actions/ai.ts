"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { generateCourseOutlineSchema } from "./schema";

export async function generateCourseOutline(topic: string, description: string) {
  const prompt = `
    You are an expert course creator. Create a comprehensive course outline for the topic: "${topic}".
    Additional context/description: ${description}
    
    The course should have 5-10 chapters.
    
    For each chapter, provide content as a list of "blocks".
    Available block types: "heading", "text", "code".
    
    - "heading": The content is the heading text. Set metadata.level to 1, 2, or 3.
    - "text": The content is the paragraph text.
    - "code": The content is the code snippet.
    
    Structure the content logically: Start with a heading, then text, maybe code if relevant.
    
    DO NOT generate "image" or "video" blocks. These will be added later.
  `;

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: generateCourseOutlineSchema,
    prompt: prompt,
  });

  return object;
}
