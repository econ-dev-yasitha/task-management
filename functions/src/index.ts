import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

const CATEGORIES = [
  "Work",
  "Personal",
  "Shopping",
  "Health",
  "Finance",
  "Other",
];

const categorizeTask = async (title: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Categorize this task into one word from: ${CATEGORIES.join(
      ", "
    )}. Task: "${title}". Reply with only the category word.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Ensure the response is one of the valid categories
    if (CATEGORIES.includes(text)) {
      return text;
    }

    // If response is not a valid category, find the best match
    return "Other";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Other";
  }
};

export const autoCategorizeTasks = onDocumentCreated("tasks/{taskId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const taskData = snap.data();
    const taskId = snap.id;

    // Skip if category already exists or title is missing
    if (taskData.category || !taskData.title) {
      return;
    }

    try {
      // Call Gemini to categorize the task
      const category = await categorizeTask(taskData.title);

      // Update the Firestore document with the category
      await snap.ref.update({
        category: category,
      });

      console.log(
        `Task ${taskId} categorized as: ${category}`
      );
    } catch (error) {
      console.error(
        `Error categorizing task ${taskId}:`,
        error
      );
      // Don't fail the function, just log the error
    }
  });
