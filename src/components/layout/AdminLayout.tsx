import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Rocket,
  Building2,
  Package,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/initiatives', label: 'Initiatives', icon: Rocket },
  { href: '/admin/partners', label: 'Partners', icon: Building2 },
  { href: '/admin/products', label: 'Products', icon: Package },
];

const AdminLayout = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-4">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="https://www.tvscredit.com/images/tvs-credit-logo.svg"
                  alt="TVS Credit"
                  className="h-8"
                />
              </Link>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              <Button variant="ghost" className="w-full justify-start mb-4" asChild>
                <Link to="/">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Portal
                </Link>
              </Button>

              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={isActive(item.href, item.exact) ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive(item.href, item.exact) && 'bg-secondary'
                  )}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>

            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 min-h-screen">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
