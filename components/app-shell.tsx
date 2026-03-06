"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import { AuthForm } from "@/components/auth-form";
import { TaskDashboard } from "@/components/task-dashboard";
import type { Task } from "@/lib/types";
import { Loader2, AlertTriangle } from "lucide-react";

export default function AppShell() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Listen to auth state
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setConfigError(true);
      setAuthChecked(true);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setConfigError(true);
      setAuthChecked(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // Listen to tasks in real-time when user is logged in
  useEffect(() => {
    const db = getFirebaseDb();
    if (!user || !db) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);

    const tasksQuery = query(
      collection(db, "tasks"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const taskList: Task[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          title: docSnap.data().title as string,
          is_completed: docSnap.data().is_completed as boolean,
          created_at: docSnap.data().created_at as number,
          due_date: docSnap.data().due_date ?? null,
          category: docSnap.data().category ?? null,
        }));
        setTasks(taskList);
        setTasksLoading(false);
      },
      () => {
        setTasksLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const handleAuth = useCallback(
    async (email: string, password: string, isLogin: boolean) => {
      const auth = getFirebaseAuth();
      if (!auth) return;
      setAuthError(null);
      setAuthLoading(true);
      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? "";
        const messages: Record<string, string> = {
          "auth/invalid-email": "Please enter a valid email address.",
          "auth/user-disabled": "This account has been disabled.",
          "auth/user-not-found": "No account found with this email.",
          "auth/wrong-password": "Incorrect password. Please try again.",
          "auth/invalid-credential":
            "Invalid credentials. Please check your email and password.",
          "auth/email-already-in-use":
            "An account with this email already exists.",
          "auth/weak-password": "Password should be at least 6 characters.",
          "auth/too-many-requests":
            "Too many attempts. Please try again later.",
        };
        setAuthError(
          messages[code] ?? "An unexpected error occurred. Please try again."
        );
      } finally {
        setAuthLoading(false);
      }
    },
    []
  );

  const handleLogout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  }, []);

  const handleAddTask = useCallback(
    async (title: string, dueDate?: number | null) => {
      const db = getFirebaseDb();
      if (!user || !db) return;
      await addDoc(collection(db, "tasks"), {
        title,
        is_completed: false,
        created_at: Date.now(),
        user_id: user.uid,
        due_date: dueDate ?? null,
      });
    },
    [user]
  );

  const handleToggleTask = useCallback(
    async (id: string, is_completed: boolean) => {
      const db = getFirebaseDb();
      if (!db) return;
      await updateDoc(doc(db, "tasks", id), { is_completed });
    },
    []
  );

  const handleDeleteTask = useCallback(async (id: string) => {
    const db = getFirebaseDb();
    if (!db) return;
    await deleteDoc(doc(db, "tasks", id));
  }, []);

  // Firebase not configured
  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 size-10 text-destructive" />
          <h2 className="mb-2 text-lg font-semibold text-card-foreground">
            Firebase Not Configured
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Firebase environment variables are missing or incomplete. Please
            set <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">NEXT_PUBLIC_FIREBASE_API_KEY</code> and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code> in
            your environment to get started.
          </p>
        </div>
      </div>
    );
  }

  // Auth check loading screen
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in - show auth form
  if (!user) {
    return (
      <AuthForm
        onSubmit={handleAuth}
        error={authError}
        loading={authLoading}
      />
    );
  }

  // Logged in - show dashboard
  return (
    <TaskDashboard
      tasks={tasks}
      loading={tasksLoading}
      userEmail={user.email}
      onAddTask={handleAddTask}
      onToggleTask={handleToggleTask}
      onDeleteTask={handleDeleteTask}
      onLogout={handleLogout}
    />
  );
}
