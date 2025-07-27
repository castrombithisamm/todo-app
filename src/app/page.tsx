import { TodoList } from '@/components/TodoList';
import { Todo } from '@/lib/types';

async function getTodos() {
  const res = await fetch('https://dummyjson.com/todos?limit=0', {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  if (!res.ok) {
    throw new Error('Failed to fetch todos');
  }
  const data = await res.json();
  return data.todos as Todo[];
}

export default async function Home() {
  const todos = await getTodos();

  return (
    <main className="min-h-screen p-8">
      <TodoList initialTodos={todos} />
    </main>
  );
}