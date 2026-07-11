import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Compass, ShieldCheck, Settings, LogOut, Menu, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Discover', icon: Compass, match: (p: string) => p === '/' || p.startsWith('/initiatives') },
];

const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { pathname } = useLocation();
  const { isAdmin, user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = user?.email?.charAt(0).toUpperCase() ?? 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const items = [
    ...navItems,
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck, match: (p: string) => p.startsWith('/admin') }]
      : []),
  ];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <div className="h-3.5 w-3.5 rounded-full bg-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-base font-bold tracking-tight">
            TVS <span className="text-primary">Credit</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Initiatives Portal</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Workspace</p>
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent/60 transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.email ?? 'Signed in'}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{userRole ?? 'user'}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{userRole ?? 'user'}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const pageTitleFor = (pathname: string) => {
  if (pathname === '/') return 'Digital Initiatives Portal';
  if (pathname.startsWith('/initiatives')) return 'Initiative Details';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Digital Initiatives Portal';
};

const TopBar = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4 md:px-8">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarNav />
          </SheetContent>
        </Sheet>
        <h1 className="font-display text-lg md:text-xl font-bold text-foreground">
          {pageTitleFor(pathname)}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

const MainLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border">
        <SidebarNav />
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-card/40 px-4 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} TVS Credit Services Ltd. Internal portal.</p>
            <nav className="flex gap-5">
              <a href="#" className="hover:text-foreground transition-colors">System Status</a>
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
