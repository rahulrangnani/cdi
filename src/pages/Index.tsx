import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInitiatives } from '@/hooks/useInitiatives';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, ArrowRight, Loader2 } from 'lucide-react';

const Index = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: initiatives, isLoading, error } = useInitiatives({
    status: statusFilter,
    search: search,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-destructive">Failed to load initiatives. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - Green gradient */}
      <div className="bg-gradient-to-r from-tvs-green to-tvs-green-dark rounded-xl p-8 text-white shadow-lg">
        <p className="text-white/90 max-w-2xl text-lg">
          Discover and explore TVS Credit's digital initiatives, partner integrations, and API documentation
        </p>
      </div>

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
            <Card key={initiative.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {initiative.logo_url ? (
                      <img
                        src={initiative.logo_url}
                        alt={initiative.name}
                        className="h-12 w-12 rounded-lg object-contain bg-muted p-1"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-tvs-green to-tvs-green-dark flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {initiative.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg text-foreground">{initiative.name}</CardTitle>
                      {initiative.category && (
                        <p className="text-xs text-muted-foreground font-medium">{initiative.category}</p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={initiative.status === 'active' ? 'default' : 'secondary'}
                    className={initiative.status === 'active' ? 'bg-primary hover:bg-primary/90' : ''}
                  >
                    {initiative.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2 text-muted-foreground">
                  {initiative.description || 'No description available'}
                </CardDescription>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{initiative.initiative_partners?.length || 0} Partners</span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                    <Link to={`/initiatives/${initiative.id}`}>
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
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
