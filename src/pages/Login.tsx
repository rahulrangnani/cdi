import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Sparkles, Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({ variant: 'destructive', title: 'Login failed', description: error.message });
      setIsLoading(false);
      return;
    }

    toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Brand pane */}
      <div className="hidden lg:flex flex-col justify-between bg-secondary text-secondary-foreground p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-foreground/10 backdrop-blur">
            <div className="h-4 w-4 rounded-full bg-primary" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-primary">Your Brand</span>
          </span>
        </div>

        <div className="relative max-w-md space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary-foreground/60">Internal Platform</p>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
            Digital Initiatives Portal.
          </h1>
          <p className="text-base text-secondary-foreground/80">
            Discover, evaluate and compare every partner integration powering your organization's digital products —
            in one calm, secure workspace.
          </p>

          <ul className="space-y-3 pt-4">
            {[
              { icon: Sparkles, text: 'Browse initiatives by journey or product' },
              { icon: Users, text: 'Compare partners across features & commercials' },
              { icon: ShieldCheck, text: 'Secured for verified company identities' },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-secondary-foreground/85">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-foreground/10">
                  <f.icon className="h-4 w-4 text-primary" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-secondary-foreground/50">
          © {new Date().getFullYear()} Your Company. Confidential internal portal.
        </p>
      </div>

      {/* Form pane */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <div className="h-4 w-4 rounded-full bg-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              <span className="text-primary">Your Brand</span>
            </span>
          </div>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Welcome back</p>
            <h2 className="font-display text-3xl font-bold text-foreground">Sign in to continue</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Use your <span className="font-medium text-foreground">company</span> account to access the portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-card"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <p className="text-sm text-muted-foreground text-center pt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
