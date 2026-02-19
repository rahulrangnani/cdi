import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInitiatives, useSubInitiatives } from '@/hooks/useInitiatives';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, ArrowRight, Loader2, ChevronRight, Layers, ArrowLeft } from 'lucide-react';

// Sub-initiatives shown when a main category is selected
const SubInitiativeList = ({
  parentId,
  parentName,
  onBack,
}: {
  parentId: string;
  parentName: string;
  onBack: () => void;
}) => {
  const { data: subs, isLoading } = useSubInitiatives(parentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={onBack}
          className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">{parentName}</span>
      </div>

      {/* Sub-initiative heading */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{parentName}</h2>
        <p className="text-muted-foreground mt-1">
          Select a sub-initiative to view partner integrations
        </p>
      </div>

      {subs && subs.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {subs.map((sub) => (
            <Link key={sub.id} to={`/initiatives/${sub.id}`}>
              <div className="group relative bg-card border border-border/60 rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                {/* Colored left accent bar */}
                <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="pl-3 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-tight">
                      {sub.name}
                    </h3>
                    <Badge
                      variant={sub.status === 'active' ? 'default' : 'secondary'}
                      className={`shrink-0 text-xs ${sub.status === 'active' ? 'bg-primary/90' : ''}`}
                    >
                      {sub.status}
                    </Badge>
                  </div>

                  {sub.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{sub.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{sub.initiative_partners?.length || 0} Partner{(sub.initiative_partners?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center border-2 border-dashed border-border rounded-xl py-16">
          <Layers className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No sub-initiatives yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Sub-initiatives for {parentName} will appear here
          </p>
        </div>
      )}
    </div>
  );
};

// Main category card
const CategoryCard = ({
  initiative,
  onClick,
}: {
  initiative: any;
  onClick: () => void;
}) => {
  const partnerCount = initiative.initiative_partners?.length || 0;

  return (
    <div
      onClick={onClick}
      className="group relative bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Top gradient strip */}
      <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary" />

      <div className="p-6 space-y-4">
        {/* Icon + Name */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
              {initiative.name}
            </h3>
            {initiative.category && (
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{initiative.category}</p>
            )}
          </div>
          <Badge
            variant={initiative.status === 'active' ? 'default' : 'secondary'}
            className={`shrink-0 ${initiative.status === 'active' ? 'bg-primary/90' : ''}`}
          >
            {initiative.status}
          </Badge>
        </div>

        {initiative.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{initiative.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{partnerCount} Partner{partnerCount !== 1 ? 's' : ''}</span>
          </div>
          <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Explore
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedParent, setSelectedParent] = useState<{ id: string; name: string } | null>(null);

  // Only fetch top-level (parent) initiatives
  const { data: initiatives, isLoading, error } = useInitiatives({
    status: statusFilter,
    search: search,
    parentId: null,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-destructive">Failed to load initiatives. Please try again.</p>
      </div>
    );
  }

  if (selectedParent) {
    return (
      <SubInitiativeList
        parentId={selectedParent.id}
        parentName={selectedParent.name}
        onBack={() => setSelectedParent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search initiatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : initiatives && initiatives.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((initiative) => (
            <CategoryCard
              key={initiative.id}
              initiative={initiative}
              onClick={() => setSelectedParent({ id: initiative.id, name: initiative.name })}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Layers className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg text-muted-foreground mb-2">No initiatives found</p>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try adjusting your search or filters' : 'Check back later for new initiatives'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
