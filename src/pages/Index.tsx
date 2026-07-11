import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuckets, useCategoriesByBucket, useSubInitiatives } from '@/hooks/useInitiatives';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, ArrowRight, Loader2, ChevronRight, Layers, ArrowLeft, FolderOpen, Package } from 'lucide-react';

type Crumb = { id: string; name: string };

// Level 3: sub-initiatives inside a main category
const SubInitiativeList = ({
  category,
  bucket,
  onBackToBuckets,
  onBackToCategories,
}: {
  category: Crumb;
  bucket: Crumb;
  onBackToBuckets: () => void;
  onBackToCategories: () => void;
}) => {
  const { data: subs, isLoading } = useSubInitiatives(category.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <button onClick={onBackToBuckets} className="hover:text-foreground transition-colors font-medium flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          All Buckets
        </button>
        <ChevronRight className="h-4 w-4" />
        <button onClick={onBackToCategories} className="hover:text-foreground transition-colors font-medium">
          {bucket.name}
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">{category.name}</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
        <p className="text-muted-foreground mt-1">Select an initiative to view partner integrations</p>
      </div>

      {subs && subs.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {[...subs]
            .sort((a, b) => (b.initiative_partners?.length || 0) - (a.initiative_partners?.length || 0))
            .map((sub) => (
              <Link key={sub.id} to={`/initiatives/${sub.id}`} className="flex">
                <div className="group relative bg-card border border-border/60 rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col w-full">
                  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="pl-3 flex flex-col flex-1 gap-3">
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
                    <div className="flex-1">
                      {sub.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{sub.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/40">
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
          <p className="text-lg font-medium text-muted-foreground">No initiatives yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Initiatives for {category.name} will appear here
          </p>
        </div>
      )}
    </div>
  );
};

// Level 2: categories inside a bucket
const CategoryList = ({
  bucket,
  onBack,
  onCategoryClick,
}: {
  bucket: Crumb;
  onBack: () => void;
  onCategoryClick: (c: Crumb) => void;
}) => {
  const { data: categories, isLoading } = useCategoriesByBucket(bucket.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sorted = [...(categories || [])].sort((a: any, b: any) => {
    const aHas = (a.initiative_partners?.length || 0) > 0 ? 1 : 0;
    const bHas = (b.initiative_partners?.length || 0) > 0 ? 1 : 0;
    return bHas - aHas;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={onBack} className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          All Buckets
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-semibold">{bucket.name}</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">{bucket.name}</h2>
        <p className="text-muted-foreground mt-1">Select a main category to explore its initiatives</p>
      </div>

      {sorted.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {sorted.map((cat: any) => (
            <div
              key={cat.id}
              onClick={() => onCategoryClick({ id: cat.id, name: cat.name })}
              className="group relative bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary shrink-0" />
              <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Main Category</p>
                  </div>
                  <Badge
                    variant={cat.status === 'active' ? 'default' : 'secondary'}
                    className={`shrink-0 ${cat.status === 'active' ? 'bg-primary/90' : ''}`}
                  >
                    {cat.status}
                  </Badge>
                </div>
                <div className="flex-1">
                  {cat.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-end pt-3 border-t border-border/50 mt-auto">
                  <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore Initiatives
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center border-2 border-dashed border-border rounded-xl py-16">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No categories yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Categories for {bucket.name} will appear here
          </p>
        </div>
      )}
    </div>
  );
};

// Level 1: buckets
const BucketCard = ({ bucket, onClick }: { bucket: any; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group relative bg-card border border-border/60 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
  >
    <div className="h-2 w-full bg-gradient-to-r from-secondary to-primary shrink-0" />
    <div className="p-6 flex flex-col flex-1 gap-4">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center shrink-0">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
            {bucket.name}
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Bucket</p>
        </div>
        <Badge
          variant={bucket.status === 'active' ? 'default' : 'secondary'}
          className={`shrink-0 ${bucket.status === 'active' ? 'bg-primary/90' : ''}`}
        >
          {bucket.status}
        </Badge>
      </div>
      <div className="flex-1">
        {bucket.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{bucket.description}</p>
        )}
      </div>
      <div className="flex items-center justify-end pt-3 border-t border-border/50 mt-auto">
        <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
          Explore Categories
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBucket, setSelectedBucket] = useState<Crumb | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Crumb | null>(null);

  const { data: buckets, isLoading, error } = useBuckets({
    status: statusFilter,
    search,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-destructive">Failed to load. Please try again.</p>
      </div>
    );
  }

  if (selectedBucket && selectedCategory) {
    return (
      <SubInitiativeList
        category={selectedCategory}
        bucket={selectedBucket}
        onBackToBuckets={() => {
          setSelectedBucket(null);
          setSelectedCategory(null);
        }}
        onBackToCategories={() => setSelectedCategory(null)}
      />
    );
  }

  if (selectedBucket) {
    return (
      <CategoryList
        bucket={selectedBucket}
        onBack={() => setSelectedBucket(null)}
        onCategoryClick={(c) => setSelectedCategory(c)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buckets..."
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
      ) : buckets && buckets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {buckets.map((bucket: any) => (
            <BucketCard
              key={bucket.id}
              bucket={bucket}
              onClick={() => setSelectedBucket({ id: bucket.id, name: bucket.name })}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg text-muted-foreground mb-2">No buckets found</p>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try adjusting your search or filters' : 'Check back later'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
