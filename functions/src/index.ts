import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { onCall } from "firebase-functions/v2/https";

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

export const breakdownTask = onCall(async (request) => {
  const { taskId, taskTitle } = request.data;
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Break down this task into 3-5 clear actionable sub-tasks. Task: "${taskTitle}". Reply with only a JSON array of strings. Example: ["Sub-task 1", "Sub-task 2"]`;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().replace(/```json|```/g, "");
  const subtasks = JSON.parse(text);
  
  const db = getFirestore();
  for (const title of subtasks) {
    await db.collection("tasks").doc(taskId).collection("subtasks").add({
      title,
      is_completed: false,
      created_at: Date.now(),
    });
  }
  
  return { success: true, count: subtasks.length };
});

export const askCopilot = onCall(async (request: { data: { message: string; userId: string } }) => {
  const { message, userId } = request.data;

  // Fetch all tasks for this user
  const db = getFirestore();
  const tasksSnap = await db.collection("tasks")
    .where("user_id", "==", userId)
    .get();

  // Build task context including subtasks
  const tasks = await Promise.all(tasksSnap.docs.map(async (docSnap) => {
    const task = docSnap.data();
    const subtasksSnap = await db.collection("tasks")
      .doc(docSnap.id)
      .collection("subtasks")
      .get();
    const subtasks = subtasksSnap.docs.map(s => s.data().title);
    return {
      title: task.title,
      is_completed: task.is_completed,
      category: task.category ?? "Uncategorized",
      due_date: task.due_date ? new Date(task.due_date).toDateString() : "No due date",
      subtasks,
    };
  }));

  const today = new Date().toDateString();

  const prompt = `
You are a helpful task management assistant. Today is ${today}.
The user has the following tasks:
${JSON.stringify(tasks, null, 2)}

User question: "${message}"

Answer the question based only on the user's tasks above.
Be concise, friendly and helpful. If asked about due dates, 
calculate relative to today. Never make up tasks that aren't listed.
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const reply = result.response.text().trim();

  return { reply };
});
