import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard, FolderOpen, Layers, ChevronLeft, LogOut,
  Users, ShieldCheck, Package, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/buckets', label: 'Buckets', icon: Package },
  { href: '/admin/initiatives', label: 'Initiatives', icon: Layers },
  { href: '/admin/partners', label: 'Partners', icon: Users },
  { href: '/admin/access', label: 'Admin Access', icon: ShieldCheck },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = user?.email?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
            <div className="h-3.5 w-3.5 rounded-full bg-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold tracking-tight text-foreground">
              TVS <span className="text-primary">Credit</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Console</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <Link
            to="/"
            className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Portal
          </Link>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Manage</p>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-muted text-secondary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4 md:px-8">
          <h1 className="font-display text-lg md:text-xl font-bold text-foreground">Admin Console</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
