"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { LogOut, CheckSquare, Search, X } from "lucide-react";
import type { Task } from "@/lib/types";

const CATEGORIES = ["Work", "Personal", "Shopping", "Health", "Finance", "Other"];
const STATUSES = ["All", "Active", "Completed", "Overdue"];

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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      // Search filter
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory && task.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === "Active" && task.is_completed) return false;
      if (selectedStatus === "Completed" && !task.is_completed) return false;
      if (selectedStatus === "Overdue") {
        if (task.is_completed) return false;
        if (!task.due_date) return false;
        const due = new Date(task.due_date);
        due.setHours(0, 0, 0, 0);
        if (due >= today) return false;
      }

      return true;
    });
  }, [tasks, search, selectedCategory, selectedStatus]);

  const hasFilters = search || selectedCategory || selectedStatus !== "All";

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary">
              <CheckSquare className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Taskflow</span>
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
            <h1 className="text-2xl font-bold tracking-tight text-balance">My Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize your day, one task at a time.
            </p>
          </div>

          <TaskForm onAddTask={onAddTask} disabled={loading} />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                  setSelectedStatus("All");
                }}
                className="rounded-full px-3 py-1 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          <TaskList
            tasks={filteredTasks}
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