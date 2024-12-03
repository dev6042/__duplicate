/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Vertex AI Integration
 *
 * Server-side code to interact with Vertex AI
 */

"use server";

import { VertexAI } from "@google-cloud/vertexai";

// System prompt to go alongside the user prompt and any media added
const systemPrompt = `You're a food critic who loves to review food and beverage products. If you see ingredients and other things then comment on them and help people understand their choices.`;

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  location: "europe-west1",
  project: "partner-techie24lon-6042",
});
const model = "gemini-1.5-flash-002";

// Format expected when uploading from the client side
export interface MessageData {
  file: UploadFile | null;
  prompt: string;
}
export interface UploadFile {
  contents: string;
  type: string;
}

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 0.95,
  },
  systemInstruction: systemPrompt,
});
const chat = generativeModel.startChat({});

/**
 * Send a message to Gemini with a media attachment
 * @param f Form data including file and prompt fields
 * @returns A markdown encoded string from Gemini.
 */
export async function sendMessage(f: MessageData): Promise<string> {
  const file = f.file;
  const userPrompt = f.prompt;
  if (!userPrompt) {
    throw new Error("No user prompt");
  }
  if (!file) {
    throw new Error("No file");
  }

  // Send media and prompt to Gemini
  const response = await chat.sendMessageStream([
    {
      inlineData: {
        data: file.contents,
        mimeType: file.type,
      },
    },
    {
      text: userPrompt,
    },
  ]);

  // Process response and return as string
  const candidates = (await response.response).candidates;
  if (!candidates) {
    throw new Error("No candidates found");
  }
  return `${candidates[0].content.parts[0].text}`;
}
