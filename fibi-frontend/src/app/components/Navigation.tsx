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
      className={`${isHomePage ? 'fixed' : 'relative'} top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm'
          : isHomePage
          ? 'bg-transparent'
          : 'bg-gray-50 shadow-sm' // subtle gray background on non-home pages
      }`}
    >
      <div className={`max-w-7xl mx-auto px-4`}>
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl mr-2">🌱</div>
            <span
              className={`text-xl font-semibold transition-colors ${
                scrolled
                  ? 'text-gray-900'
                  : isHomePage
                  ? 'text-white'
                  : 'text-gray-900'
              }`}
            >
              FIBI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {(!isHomePage || !scrolled) && (
              <>
                <Link to="/">
                  <Button
                    variant="ghost"
                    className={`transition-colors ${
                      scrolled || !isHomePage
                        ? 'text-gray-800 hover:bg-gray-100'
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
                      scrolled || !isHomePage
                        ? 'text-gray-800 hover:bg-gray-100'
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
                        scrolled || !isHomePage
                          ? 'text-gray-800 hover:bg-gray-100'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {!scrolled && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`transition-colors ${
                          scrolled || !isHomePage
                            ? 'border-gray-300 text-gray-900'
                            : 'border-white text-white'
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
                )}
              </>
            ) : (
              <>
                {/* Login button now shows on all pages, respects scroll */}
                {!scrolled && (
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className={`transition-colors ${
                        scrolled || !isHomePage
                          ? 'text-gray-800 hover:bg-gray-100'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      Log In
                    </Button>
                  </Link>
                )}

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