import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInitiative, useCreateInitiative, useUpdateInitiative, useBuckets } from '@/hooks/useInitiatives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parent_id: z.string().min(1, 'Bucket is required'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: initiative, isLoading } = useInitiative(id!);
  const { data: buckets } = useBuckets();
  const createInitiative = useCreateInitiative();
  const updateInitiative = useUpdateInitiative();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', parent_id: '' },
  });

  useEffect(() => {
    if (initiative) {
      form.reset({
        name: initiative.name,
        description: initiative.description || '',
        parent_id: initiative.parent_id || '',
      });
    }
  }, [initiative, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        parent_id: data.parent_id,
        level: 'category',
        status: 'active',
        category: null,
        logo_url: null,
        overview: null,
      } as any;

      if (isEditing) {
        await updateInitiative.mutateAsync({ id, ...payload });
        toast({ title: 'Category updated successfully' });
      } else {
        await createInitiative.mutateAsync(payload);
        toast({ title: 'Category created successfully' });
      }
      navigate('/admin/initiatives');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `Failed to ${isEditing ? 'update' : 'create'} category`,
        description: 'Please try again.',
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/initiatives">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Main Category' : 'Create Main Category'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update this main category' : 'A main category sits under a bucket and groups related initiatives.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Hierarchy: Bucket → Main Category → Initiative.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bucket *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bucket" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buckets?.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Every main category must belong to a bucket. Create buckets under Admin → Buckets.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., KYC, Voice Bots, Credit Bureau" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of what this category covers..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={createInitiative.isPending || updateInitiative.isPending}
                >
                  {(createInitiative.isPending || updateInitiative.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? 'Update Category' : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/admin/initiatives">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryForm;
