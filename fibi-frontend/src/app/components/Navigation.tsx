import { Link, useLocation } from 'react-router';
import { LayoutDashboard, FolderOpen, Home, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

export function Navigation() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, logout, isAuthenticated } = useAuth();
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

          {/* Logo - ALWAYS visible on home even when scrolled */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl mr-2">🌱</div>
            <span
              className={`text-xl font-semibold transition-colors ${
                isHomePage
                  ? scrolled
                    ? 'text-black'  // scrolling on home page (over white sections)
                    : 'text-white'  // hero section
                  : 'text-white'    // all other pages
              }`}
            >
              FIBI
            </span>
          </Link>

          {/* Middle Navigation Links */}
          <div
            className={`flex items-center gap-1 transition-opacity duration-300 ${
              isHomePage && scrolled ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <Link to="/">
              <Button
                variant="ghost"
                className={`transition-colors ${
                  isHomePage && !scrolled
                    ? 'text-white hover:bg-white/20'
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
                className={`transition-colors ${
                  isHomePage && !scrolled
                    ? 'text-white hover:bg-white/20'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects
              </Button>
            </Link>

            {isAuthenticated && (
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  className={`transition-colors ${
                    isHomePage && !scrolled
                      ? 'text-white hover:bg-white/20'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Right Side Auth Section */}
          <div className="flex items-center gap-2">

            {isAuthenticated ? (
              <>
                {/* Hide user dropdown on home when scrolled */}
                <div
                  className={`transition-opacity duration-300 ${
                    isHomePage && scrolled ? 'opacity-0 pointer-events-none' : ''
                  }`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`transition-colors ${
                          isHomePage && !scrolled
                            ? 'border-white text-white'
                            : 'border-gray-300 text-gray-900'
                        }`}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {user?.name}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-red-600"
                      >
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Hide login on home when scrolled */}
                <div
                  className={`transition-opacity duration-300 ${
                    isHomePage && scrolled ? 'opacity-0 pointer-events-none' : ''
                  }`}
                >
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className={`transition-colors ${
                        isHomePage && !scrolled
                          ? 'text-white hover:bg-white/20'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      Log In
                    </Button>
                  </Link>
                </div>

                {/* Join Investment ALWAYS visible on home */}
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