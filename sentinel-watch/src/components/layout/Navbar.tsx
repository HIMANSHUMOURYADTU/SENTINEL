import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Shield, Menu, X, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/useAuth';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role: userRole, logout, loading } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = user
    ? userRole === 'admin'
      ? [
          { href: '/', label: 'HOME' },
          { href: '/admin', label: 'ADMIN' },
          { href: '/calls', label: 'CALLS' },
        ]
      : [
          { href: '/', label: 'HOME' },
          { href: '/dashboard', label: 'DASHBOARD' },
          { href: '/calls', label: 'CALLS' },
        ]
    : [{ href: '/', label: 'HOME' }];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      navigate('/login');
    } catch {
      toast({
        title: 'Logout failed',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              <motion.div
                className="absolute inset-0 bg-primary/30 rounded-full blur-lg"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="font-display text-xl tracking-wider">VOICESENTINEL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-3 py-2 text-xs font-mono tracking-wider transition-colors relative',
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Section (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-32 block">
                    {user.email}
                  </span>
                  <span className="text-[10px] font-mono text-primary uppercase">
                    {userRole}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs tracking-wider gap-2"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LogOut className="w-3 h-3" />
                  )}
                  LOGOUT
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs tracking-wider"
                >
                  LOGIN
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'block px-3 py-2 text-sm font-mono tracking-wider rounded',
                    location.pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!loading && user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 font-mono text-xs tracking-wider gap-2"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <LogOut className="w-3 h-3" />
                  )}
                  LOGOUT
                </Button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 font-mono text-xs tracking-wider"
                  >
                    LOGIN
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
