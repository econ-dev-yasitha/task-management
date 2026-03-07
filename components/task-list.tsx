"use client";

import { TaskItem } from "@/components/task-item";
import { Loader2, ClipboardList } from "lucide-react";
import type { Task } from "@/lib/types";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string, is_completed: boolean) => void;
  onDelete: (id: string) => void;
  onBreakdown: (id: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, is_completed: boolean) => void;
}

export function TaskList({ tasks, loading, onToggle, onDelete, onBreakdown, onToggleSubtask }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Loading your tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <ClipboardList className="size-10 opacity-50" />
        <div className="text-center">
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm">Add your first task above to get started.</p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {completedCount} of {tasks.length} completed
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onBreakdown={onBreakdown}
            onToggleSubtask={onToggleSubtask}
          />
        ))}
      </div>
    </div>
  );
}
