"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function generateCourseOutline(topic: string, description: string, author: string) {
  const schema = z.object({
    courseTitle: z.string(),
    courseDescription: z.string(),
    author: z.string(),
    chapters: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        content: z.array(
          z.object({
            heading: z.string(),
            subHeading: z.string(),
            imageUrl: z.url().optional(),
            videoUrl: z.url().optional(),
            text: z.string().optional(),
            code: z.string().optional(),
          })
        ),
      })
    ),
  });

  // .regex(/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[a-zA-Z0-9_-]+/)

  const prompt = `
    You are an expert course creator. Create a comprehensive course outline for the topic: "${topic}".
    
    Author: ${author}.
    Additional context/description: ${description}
    
    The course should have 5-10 chapters. Each chapter should have a title and a brief summary of the content.
    For each chapter, provide detailed content including headings, subheadings, and explanatory text.
    Where appropriate, include code snippets.
    
    DO NOT include videoUrl or imageUrl fields - these will be added automatically.
    
    Ensure the chapters follow a logical progression and the content is educational and engaging.
  `;

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: schema,
    prompt: prompt,
  });

  return object;
}
