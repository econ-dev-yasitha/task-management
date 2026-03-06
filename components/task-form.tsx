"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface TaskFormProps {
  onAddTask: (title: string, dueDate?: number | null) => Promise<void>;
  disabled?: boolean;
}

export function TaskForm({ onAddTask, disabled }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const dueDateTimestamp = dueDate ? new Date(dueDate).getTime() : null;
      await onAddTask(trimmed, dueDateTimestamp);
      setTitle("");
      setDueDate("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled || submitting}
          aria-label="New task title"
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={disabled || submitting || !title.trim()}
          size="default"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add task</span>
        </Button>
      </div>
      <Input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        disabled={disabled || submitting}
        aria-label="Due date (optional)"
        className="w-full sm:max-w-xs"
      />
      {dueDate && (
        <p className="text-xs text-muted-foreground">
          Due date: {new Date(dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </p>
      )}
    </form>
  );
}
