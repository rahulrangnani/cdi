import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInitiatives, useDeleteInitiative } from '@/hooks/useInitiatives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InitiativesManagement = () => {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: initiatives, isLoading } = useInitiatives({ search });
  const deleteInitiative = useDeleteInitiative();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteInitiative.mutateAsync(deleteId);
      toast({ title: 'Initiative deleted successfully' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete initiative',
        description: 'Please try again.',
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Initiatives</h1>
          <p className="text-muted-foreground">Manage digital initiatives</p>
        </div>
        <Button asChild>
          <Link to="/admin/initiatives/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Initiative
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search initiatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Partners</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initiatives && initiatives.length > 0 ? (
                initiatives.map((initiative) => (
                  <TableRow key={initiative.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {initiative.logo_url ? (
                          <img
                            src={initiative.logo_url}
                            alt={initiative.name}
                            className="h-8 w-8 rounded object-contain"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {initiative.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="font-medium">{initiative.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{initiative.category || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={initiative.status === 'active' ? 'default' : 'secondary'}>
                        {initiative.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{initiative.initiative_partners?.length || 0}</TableCell>
                    <TableCell>
                      {new Date(initiative.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/initiatives/${initiative.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/initiatives/${initiative.id}/partners`}>
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Partners
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(initiative.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No initiatives found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Initiative</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this initiative? This action cannot be undone and will
              also remove all associated partner configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InitiativesManagement;
