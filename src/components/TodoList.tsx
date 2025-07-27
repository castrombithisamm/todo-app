'use client';

import { useState } from 'react';
import { Todo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TodoForm } from '@/components/TodoForm';
import { toast } from 'sonner';
import { ArrowUpDown } from 'lucide-react';

interface TodoListProps {
  initialTodos: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredTodos = todos
    .filter((t) => {
      if (filter === 'completed') return t.completed;
      if (filter === 'incomplete') return !t.completed;
      return true;
    })
    .filter((t) => t.todo.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sortOrder === 'asc' ? a.id - b.id : b.id - a.id));

  const handleAdd = async (data: { todo: string; completed: boolean; userId: number }) => {
    try {
      const res = await fetch('https://dummyjson.com/todos/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add');
      const newTodo: Todo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
      toast.success('Success', { description: 'Todo added!' });
      return newTodo;
    } catch {
      return null;
    }
  };

  const handleUpdate = (id: number) => async (data: { todo: string; completed: boolean; userId: number }) => {
    const oldTodo = todos.find((t) => t.id === id);
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t))); // Optimistic update
    try {
      const res = await fetch(`https://dummyjson.com/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updatedTodo: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));
      toast.success('Success', { description: 'Todo updated!' });
      return updatedTodo;
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? oldTodo! : t))); // Rollback
      return null;
    }
  };

  const handleDelete = async (id: number) => {
    const oldTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id)); // Optimistic delete
    try {
      const res = await fetch(`https://dummyjson.com/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Success', { description: 'Todo deleted!' });
    } catch {
      setTodos(oldTodos); // Rollback
      return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Todo List
          <TodoForm onSubmit={handleAdd}>
            <Button>Add Todo</Button>
          </TodoForm>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Input
            placeholder="Search todos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'incomplete')}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            Sort by ID <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Todo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTodos.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.todo}</TableCell>
                <TableCell>
                  <Badge variant={t.completed ? 'default' : 'secondary'}>
                    {t.completed ? 'Completed' : 'Incomplete'}
                  </Badge>
                </TableCell>
                <TableCell>{t.userId}</TableCell>
                <TableCell className="space-x-2">
                  <TodoForm todo={t} onSubmit={handleUpdate(t.id)}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TodoForm>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredTodos.length === 0 && <p className="text-center mt-4">No todos found.</p>}
      </CardContent>
    </Card>
  );
}