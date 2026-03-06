export interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: number;
  user_id?: string;
  due_date?: number | null;
  category?: string | null;
}
