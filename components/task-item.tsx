"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, is_completed: boolean) => void;
  onDelete: (id: string) => void;
}

function getDueDateStatus(dueDate: number | null | undefined) {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);

  const timeDiff = dueDateObj.getTime() - today.getTime();
  const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

  if (dayDiff === 0) return "today";
  if (dayDiff < 0) return "overdue";
  return null;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const dueDateStatus = getDueDateStatus(task.due_date);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="group flex items-start gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/50">
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
        aria-label={`Mark "${task.title}" as ${task.is_completed ? "incomplete" : "complete"}`}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm leading-relaxed transition-colors",
              task.is_completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </span>
          {task.category && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {task.category}
            </span>
          )}
          {dueDateStatus === "overdue" && !task.is_completed && (
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Overdue
            </span>
          )}
          {dueDateStatus === "today" && !task.is_completed && (
            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
              Due today
            </span>
          )}
        </div>
        {formattedDueDate && (
          <p className="mt-1 text-xs text-muted-foreground">
            Due: {formattedDueDate}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(task.id)}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 flex-shrink-0"
        aria-label={`Delete task "${task.title}"`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
