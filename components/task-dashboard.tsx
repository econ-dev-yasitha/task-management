"use client";

import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { LogOut, CheckSquare } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskDashboardProps {
  tasks: Task[];
  loading: boolean;
  userEmail: string | null;
  onAddTask: (title: string, dueDate?: number | null) => Promise<void>;
  onToggleTask: (id: string, is_completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  onLogout: () => void;
  onBreakdownTask: (id: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, is_completed: boolean) => void;
}

export function TaskDashboard({
  tasks,
  loading,
  userEmail,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onLogout,
  onBreakdownTask,
  onToggleSubtask,
}: TaskDashboardProps) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary">
              <CheckSquare className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Taskflow
            </span>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {userEmail}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">
              My Tasks
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize your day, one task at a time.
            </p>
          </div>

          <TaskForm onAddTask={onAddTask} disabled={loading} />

          <TaskList
            tasks={tasks}
            loading={loading}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onBreakdown={onBreakdownTask}
            onToggleSubtask={onToggleSubtask}
          />
        </div>
      </main>
    </div>
  );
}
