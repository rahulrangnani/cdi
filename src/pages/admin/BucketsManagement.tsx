import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuckets, useDeleteInitiative } from '@/hooks/useInitiatives';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Loader2, Package, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const useCategoryCounts = () => {
  return useQuery({
    queryKey: ['initiatives', 'categoryCountsByBucket'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select('parent_id')
        .eq('level', 'category');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        if (row.parent_id) counts[row.parent_id] = (counts[row.parent_id] || 0) + 1;
      });
      return counts;
    },
  });
};

const BucketsManagement = () => {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: buckets, isLoading } = useBuckets({ search });
  const { data: counts } = useCategoryCounts();
  const deleteInitiative = useDeleteInitiative();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInitiative.mutateAsync(deleteId);
      toast({ title: 'Bucket deleted' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete', description: 'Move or delete its categories first.' });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buckets</h1>
          <p className="text-muted-foreground mt-1">
            Top-level groupings. Bucket → Main Category → Initiative.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/buckets/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Bucket
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search buckets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !buckets || buckets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No buckets yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create a bucket to start grouping main categories.
          </p>
          <Button asChild>
            <Link to="/admin/buckets/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Bucket
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {buckets.map((bucket: any) => {
            const categoryCount = counts?.[bucket.id] || 0;
            return (
              <Card key={bucket.id} className="border border-border/60">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base text-foreground truncate">
                            {bucket.name}
                          </span>
                          <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                            Bucket
                          </Badge>
                        </div>
                        {bucket.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {bucket.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/buckets/${bucket.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Bucket
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(bucket.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Bucket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-4 px-5">
                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FolderOpen className="h-4 w-4" />
                      <span>{categoryCount} main categor{categoryCount === 1 ? 'y' : 'ies'}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/admin/initiatives">Manage categories →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bucket?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bucket. Its categories must be moved or deleted first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BucketsManagement;
