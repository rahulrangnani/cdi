import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuckets, useCategoriesByBucket, useSubInitiatives } from '@/hooks/useInitiatives';
import { useProducts } from '@/hooks/useProducts';
import { useProductScopedTree } from '@/hooks/useProductScopedTree';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, ArrowRight, Loader2, ChevronRight, Layers, ArrowLeft, FolderOpen, Package, X, Box } from 'lucide-react';

type Crumb = { id: string; name: string };
type ViewMode = 'journey' | 'product';

// ─── Level 3: sub-initiatives inside a category ─────────────────────────────
const SubInitiativeList = ({
  category,
  bucket,
  onBackToBuckets,
  onBackToCategories,
  allowedInitiativeIds,
  productQuery,
}: {
  category: Crumb;
  bucket: Crumb;
  onBackToBuckets: () => void;
  onBackToCategories: () => void;
  allowedInitiativeIds?: Set<string>;
  productQuery?: string;
}) => {
  const { data: subs, isLoading } = useSubInitiatives(category.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filtered = allowedInitiativeIds
    ? (subs || []).filter((s) => allowedInitiativeIds.has(s.id))
    : (subs || []);

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
        <h2 className="font-display text-2xl font-bold text-foreground">{category.name}</h2>
        <p className="text-muted-foreground mt-1 text-sm">Select an initiative to view partner integrations</p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {[...filtered]
            .sort((a, b) => (b.initiative_partners?.length || 0) - (a.initiative_partners?.length || 0))
            .map((sub) => {
              const count = sub.initiative_partners?.length || 0;
              return (
                <Link
                  key={sub.id}
                  to={`/initiatives/${sub.id}${productQuery ? `?product=${productQuery}` : ''}`}
                  className="flex"
                >
                  <div className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col w-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Layers className="h-5 w-5" />
                      </div>
                      <Badge
                        variant={sub.status === 'active' ? 'default' : 'secondary'}
                        className={`text-[10px] font-bold uppercase tracking-wider ${sub.status === 'active' ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-secondary transition-colors leading-tight">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{sub.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mt-6 pt-4 border-t border-border/70">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {count} Partner{count !== 1 ? 's' : ''}
                      </span>
                      <span className="ml-auto text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        View details <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
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

// ─── Level 2: categories inside a bucket ────────────────────────────────────
const CategoryList = ({
  bucket,
  onBack,
  onCategoryClick,
  allowedCategoryIds,
}: {
  bucket: Crumb;
  onBack: () => void;
  onCategoryClick: (c: Crumb) => void;
  allowedCategoryIds?: Set<string>;
}) => {
  const { data: categories, isLoading } = useCategoriesByBucket(bucket.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const scoped = allowedCategoryIds
    ? (categories || []).filter((c: any) => allowedCategoryIds.has(c.id))
    : (categories || []);

  const sorted = [...scoped].sort((a: any, b: any) => {
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
        <h2 className="font-display text-2xl font-bold text-foreground">{bucket.name}</h2>
        <p className="text-muted-foreground mt-1 text-sm">Select a main category to explore its initiatives</p>
      </div>

      {sorted.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {sorted.map((cat: any) => (
            <div
              key={cat.id}
              onClick={() => onCategoryClick({ id: cat.id, name: cat.name })}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <Badge
                  variant={cat.status === 'active' ? 'default' : 'secondary'}
                  className={`text-[10px] font-bold uppercase tracking-wider ${cat.status === 'active' ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
                >
                  {cat.status}
                </Badge>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground group-hover:text-secondary transition-colors leading-tight">
                {cat.name}
              </h3>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">Main Category</p>
              {cat.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{cat.description}</p>
              )}
              <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/70">
                <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore initiatives <ChevronRight className="h-4 w-4" />
                </span>
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

// ─── Level 1: bucket card ───────────────────────────────────────────────────
const BucketCard = ({ bucket, onClick }: { bucket: any; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
        <Package className="h-5 w-5" />
      </div>
      <Badge
        variant={bucket.status === 'active' ? 'default' : 'secondary'}
        className={`text-[10px] font-bold uppercase tracking-wider ${bucket.status === 'active' ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''}`}
      >
        {bucket.status}
      </Badge>
    </div>
    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-secondary transition-colors leading-tight">
      {bucket.name}
    </h3>
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">Bucket</p>
    {bucket.description && (
      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{bucket.description}</p>
    )}
    <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/70">
      <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
        Explore categories <ChevronRight className="h-4 w-4" />
      </span>
    </div>
  </div>
);


// ─── Product picker (step 1 of product view) ────────────────────────────────
const ProductPicker = ({ onSelect }: { onSelect: (p: { id: string; name: string }) => void }) => {
  const { data: products, isLoading } = useProducts(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Browse by Product</h2>
        <p className="text-muted-foreground mt-1 text-sm">Pick a product to see the journeys and partners powering it</p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect({ id: p.id, name: p.name })}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Box className="h-5 w-5" />
                </div>
                <Badge className="text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary hover:bg-secondary/15">
                  Product
                </Badge>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground group-hover:text-secondary transition-colors leading-tight">
                {p.name}
              </h3>
              {p.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1">{p.description}</p>
              )}
              <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/70">
                <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  View journeys <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

      ) : (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center border-2 border-dashed border-border rounded-xl py-16">
          <Box className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No products yet</p>
        </div>
      )}
    </div>
  );
};

// ─── Journey list (buckets, optionally scoped by product) ───────────────────
const JourneyBuckets = ({
  search,
  statusFilter,
  onBucketClick,
  allowedBucketIds,
}: {
  search: string;
  statusFilter: string;
  onBucketClick: (b: Crumb) => void;
  allowedBucketIds?: Set<string>;
}) => {
  const { data: buckets, isLoading, error } = useBuckets({ status: statusFilter, search });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-destructive">Failed to load. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const scoped = allowedBucketIds
    ? (buckets || []).filter((b: any) => allowedBucketIds.has(b.id))
    : (buckets || []);

  if (!scoped.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-lg text-muted-foreground mb-2">No buckets found</p>
        <p className="text-sm text-muted-foreground">
          {search ? 'Try adjusting your search or filters' : 'Check back later'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
      {scoped.map((bucket: any) => (
        <BucketCard
          key={bucket.id}
          bucket={bucket}
          onClick={() => onBucketClick({ id: bucket.id, name: bucket.name })}
        />
      ))}
    </div>
  );
};

// ─── Main ───────────────────────────────────────────────────────────────────
const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('journey');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Crumb | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<Crumb | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Crumb | null>(null);

  const { data: scopedTree } = useProductScopedTree(
    viewMode === 'product' ? selectedProduct?.id : null
  );

  const resetDrill = () => {
    setSelectedBucket(null);
    setSelectedCategory(null);
  };

  const handleModeChange = (mode: string) => {
    setViewMode(mode as ViewMode);
    setSelectedProduct(null);
    resetDrill();
  };

  // ── Product view, step 1: pick a product
  if (viewMode === 'product' && !selectedProduct) {
    return (
      <div className="space-y-6">
        <ViewToggle mode={viewMode} onChange={handleModeChange} />
        <ProductPicker onSelect={(p) => setSelectedProduct(p)} />
      </div>
    );
  }

  const productChip = viewMode === 'product' && selectedProduct ? (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-2 px-3 py-1.5">
        <Box className="h-3.5 w-3.5" />
        Product: <span className="font-semibold">{selectedProduct.name}</span>
        <button
          onClick={() => { setSelectedProduct(null); resetDrill(); }}
          className="ml-1 hover:text-foreground transition-colors"
          aria-label="Clear product filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </Badge>
    </div>
  ) : null;

  // Deep view (category selected)
  if (selectedBucket && selectedCategory) {
    return (
      <div className="space-y-6">
        <ViewToggle mode={viewMode} onChange={handleModeChange} />
        {productChip}
        <SubInitiativeList
          category={selectedCategory}
          bucket={selectedBucket}
          onBackToBuckets={resetDrill}
          onBackToCategories={() => setSelectedCategory(null)}
          allowedInitiativeIds={viewMode === 'product' ? scopedTree?.initiativeIds : undefined}
          productQuery={viewMode === 'product' ? selectedProduct?.id : undefined}
        />
      </div>
    );
  }

  // Bucket selected
  if (selectedBucket) {
    return (
      <div className="space-y-6">
        <ViewToggle mode={viewMode} onChange={handleModeChange} />
        {productChip}
        <CategoryList
          bucket={selectedBucket}
          onBack={resetDrill}
          onCategoryClick={(c) => setSelectedCategory(c)}
          allowedCategoryIds={viewMode === 'product' ? scopedTree?.categoryIds : undefined}
        />
      </div>
    );
  }

  // Bucket list (root of journey drill)
  return (
    <div className="space-y-6">
      <ViewToggle mode={viewMode} onChange={handleModeChange} />
      {productChip}

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

      <JourneyBuckets
        search={search}
        statusFilter={statusFilter}
        onBucketClick={(b) => setSelectedBucket(b)}
        allowedBucketIds={viewMode === 'product' ? scopedTree?.bucketIds : undefined}
      />
    </div>
  );
};

const ViewToggle = ({ mode, onChange }: { mode: ViewMode; onChange: (m: string) => void }) => (
  <Tabs value={mode} onValueChange={onChange} className="w-full sm:w-auto">
    <TabsList className="grid grid-cols-2 w-full sm:w-[320px]">
      <TabsTrigger value="journey" className="gap-2">
        <Layers className="h-4 w-4" />
        Journey view
      </TabsTrigger>
      <TabsTrigger value="product" className="gap-2">
        <Box className="h-4 w-4" />
        Product view
      </TabsTrigger>
    </TabsList>
  </Tabs>
);

export default Index;
