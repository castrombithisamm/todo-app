'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { Todo } from '@/lib/types';
import { toast } from 'sonner';

const formSchema = z.object({
  todo: z.string().min(1, { message: 'Todo description is required' }),
  completed: z.boolean(),
  userId: z.number().min(1, { message: 'User ID must be at least 1' }),
});

type FormData = z.infer<typeof formSchema>;

interface TodoFormProps {
  todo?: Todo; // If provided, it's edit mode
  onSubmit: (data: FormData) => Promise<Todo | null>;
  children: React.ReactNode; // For trigger button
}

export function TodoForm({ todo, onSubmit, children }: TodoFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      todo: todo?.todo ?? '',
      completed: todo?.completed ?? false,
      userId: todo?.userId ?? 1,
    },
  });

  const handleSubmit: SubmitHandler<FormData> = async (values) => {
    setLoading(true);
    const result = await onSubmit(values);
    setLoading(false);
    if (result) {
      setOpen(false);
      form.reset();
    } else {
      toast.error('Error', { description: 'Operation failed. Please try again.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{todo ? 'Edit Todo' : 'Add New Todo'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="todo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Todo Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completed"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Completed</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter user ID (1-100)" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : todo ? 'Update' : 'Create'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}