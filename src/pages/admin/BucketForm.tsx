import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInitiative, useCreateInitiative, useUpdateInitiative } from '@/hooks/useInitiatives';
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
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const bucketSchema = z.object({
  name: z.string().min(1, 'Bucket name is required'),
  description: z.string().optional(),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

const BucketForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: initiative, isLoading } = useInitiative(id!);
  const createInitiative = useCreateInitiative();
  const updateInitiative = useUpdateInitiative();

  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (initiative) {
      form.reset({
        name: initiative.name,
        description: initiative.description || '',
      });
    }
  }, [initiative, form]);

  const onSubmit = async (data: BucketFormValues) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        parent_id: null,
        level: 'bucket',
        status: 'active',
        category: null,
        logo_url: null,
        overview: null,
      } as any;

      if (isEditing) {
        await updateInitiative.mutateAsync({ id, ...payload });
        toast({ title: 'Bucket updated successfully' });
      } else {
        await createInitiative.mutateAsync(payload);
        toast({ title: 'Bucket created successfully' });
      }
      navigate('/admin/buckets');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `Failed to ${isEditing ? 'update' : 'create'} bucket`,
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
          <Link to="/admin/buckets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Bucket' : 'Create Bucket'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Update this top-level bucket'
              : 'A bucket groups related main categories (e.g., Onboarding contains KYC, Voice Bots).'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Bucket Details</CardTitle>
              <CardDescription>
                Buckets are the highest tier: Bucket → Main Category → Initiative.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bucket Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Onboarding, Servicing, Collections" {...field} />
                    </FormControl>
                    <FormDescription>
                      A broad theme that groups related main categories.
                    </FormDescription>
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
                        placeholder="Brief description of what this bucket covers..."
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
                  {isEditing ? 'Update Bucket' : 'Create Bucket'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/admin/buckets">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BucketForm;
