import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, FolderOpen, Home, User, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useEffect, useState } from 'react';
import logo from "../../assets/fibi_logo.svg";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { user, logout, isAuthenticated, authReady } = useAuth();
  const { membership } = useMembership();

  const handleLogout = () => {
    void logout().then(() => navigate('/', { replace: true }));
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        !isHomePage && scrolled
          ? 'opacity-0 pointer-events-none'
          : isHomePage && scrolled
          ? 'bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="FIBI"
              className={`h-40 w-auto transition-all ${
                isHomePage
                  ? scrolled
                    ? 'invert-0'
                    : 'invert'
                  : 'invert'
              }`}
            />
          </Link>

          {/* Middle Navigation Links */}
          <div className="flex items-center gap-1 transition-opacity duration-300">
            <Link to="/">
              <Button
                variant="ghost"
                className={`text-base transition-colors ${
                  isHomePage
                    ? scrolled
                      ? 'text-black hover:bg-black/10'
                      : 'text-white hover:bg-white/20'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>

            <Link to="/projects">
              <Button
                variant="ghost"
                className={`text-base transition-colors ${
                  isHomePage
                    ? scrolled
                      ? 'text-black hover:bg-black/10'
                      : 'text-white hover:bg-white/20'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects
              </Button>
            </Link>
            <Link to="/membership">
              <Button
                variant="ghost"
                className={`text-base transition-colors ${
                  isHomePage
                    ? scrolled
                      ? 'text-black hover:bg-black/10'
                      : 'text-white hover:bg-white/20'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <BadgeCheck className="h-4 w-4 mr-2" />
                Membership
              </Button>
            </Link>

            {authReady && isAuthenticated && user && (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                <Button
                  variant="ghost"
                  className={`text-base transition-colors ${
                    isHomePage
                      ? scrolled
                        ? 'text-black hover:bg-black/10'
                        : 'text-white hover:bg-white/20'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Button>
              </Link>
            )}
          </div>

          {/* Right Side Auth Section */}
          <div className="flex items-center gap-2">

            {!authReady ? (
              <div className="h-10 w-40" aria-hidden />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`text-base transition-colors ${
                      isHomePage
                        ? scrolled
                          ? 'border-gray-300 text-black'
                          : 'border-white text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 z-[100] bg-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-slate-500 cursor-default focus:bg-transparent">
                    Membership: {membership.tier.replace('_', ' ')} ({membership.status})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                      {user?.role === 'admin' ? 'Admin dashboard' : 'Dashboard'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/membership">Membership plans</Link>
                  </DropdownMenuItem>
                  {membership.status === 'active' && (
                    <DropdownMenuItem asChild>
                      <Link to="/member-hub">Member hub</Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/memberships">Membership admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                 <Button
  variant="ghost"
  className={`text-base transition-colors ${
    isHomePage
      ? scrolled
        ? 'border-gray-300 text-black hover:bg-black/10'
        : 'border-white text-white hover:bg-white/20'
      : 'text-white hover:bg-white/20'  // <--- same as middle nav buttons
  }`}
>
  Log In
</Button>
                </Link>

                {/* Join Investment ALWAYS visible */}
                <Link to="/signup">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Join Investment
                  </Button>
                </Link>
              </>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}