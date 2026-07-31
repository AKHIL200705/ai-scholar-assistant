import { useEffect, useState } from "react";
import { createClient } from "./client";

export default function Page() {
  const [todos, setTodos] = useState<{ id: string; name?: string; title?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("todos")
      .select()
      .then(({ data, error }) => {
        if (data) setTodos(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading todos from Supabase...</div>;

  return (
    <ul className="space-y-2 p-4">
      {todos?.map((todo) => (
        <li key={todo.id} className="rounded-lg bg-muted p-2">
          {todo.name || todo.title || `Todo #${todo.id}`}
        </li>
      ))}
      {todos.length === 0 && <li className="text-sm text-muted-foreground">No todos found.</li>}
    </ul>
  );
}
