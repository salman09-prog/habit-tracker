import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export interface ParsedHabit {
  activity: string;
  quantity: number;
  unit: string;
  category: string;
  confidence: number;
}

export const parseHabitText = async (
  userInput: string
): Promise<ParsedHabit[]> => {
  try {
    const prompt = `
     You are a data extraction engine. Parse the user habit-tracking text and output ONLY a JSON array of objects, nothing else.

User Input:
"${userInput}"

Each object must follow this schema:
[
  {
    "activity": "string",      // e.g., "running", "meditation"
    "quantity": number,        // default to 1 if unspecified
    "unit": "string",          // e.g., "miles", "minutes", "glasses", "times"
    "category": "string",      // one of: health, fitness, work, learning, self_care, other
    "confidence": number       // between 0 and 1
  }
]

Extraction Rules:
1. Identify all habits mentioned and create one object per habit.
2. Default quantity to 1 when no numeric value is present.
3. Normalize units (e.g., “hrs” → “hours”, “km” → “miles”).
4. Assign category based on the activity’s closest match.
5. Estimate confidence from clarity and specificity of input.
6. If no valid habits are found, return an empty array: [].

Examples:
Input: "Ran 5 miles and meditated for 10 minutes"
Output:
[
  {"activity":"running","quantity":5,"unit":"miles","category":"fitness","confidence":0.95},
  {"activity":"meditation","quantity":10,"unit":"minutes","category":"self_care","confidence":0.90}
]

Respond with valid JSON only—no comments, explanations, or additional keys.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

    return JSON.parse(cleanText) as ParsedHabit[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to parse habit text");
  }
};
