"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function generateCourseOutline(topic: string, description: string) {
  const schema = z.object({
    courseTitle: z.string(),
    courseDescription: z.string(),
    chapters: z.array(
      z.object({
        title: z.string(),
        content: z.string().describe("A brief summary of what this chapter will cover"),
      })
    ),
  });

  const prompt = `
    You are an expert course creator. Create a comprehensive course outline for the topic: "${topic}".
    
    Additional context/description: ${description}
    
    The course should have 5-10 chapters. Each chapter should have a title and a brief summary of the content.
    Ensure the chapters follow a logical progression.
  `;

  const { object } = await generateObject({
    model: google("gemini-1.5-flash"),
    schema: schema,
    prompt: prompt,
  });

  return object;
}
