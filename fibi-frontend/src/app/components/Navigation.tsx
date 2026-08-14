import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, FolderOpen, Home, User, BadgeCheck, Menu } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from './ui/sheet';
import { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Text/icon color follows scroll + page state only. Deliberately NOT tied
  // to mobileOpen: the Sheet already renders its own overlay + solid drawer,
  // so also animating the header's own background at the same moment just
  // doubles the compositing work during the open transition (this was the
  // main cause of the drawer feeling sluggish).
  const useLightText = isHomePage ? scrolled : true;

  const navLinkClass = `text-base transition-colors ${
    useLightText ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/20'
  }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-[background-color,box-shadow,border-color] duration-300 ${
        !isHomePage && scrolled
          ? 'opacity-0 pointer-events-none'
          : isHomePage && scrolled
          ? 'bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo. Sized to always sit fully inside this h-16 bar so it
             never gets clipped by the scrolled/unscrolled background edge. */}
          <Link to="/" className="flex items-center shrink-0">
            <LogoMark
              className={`h-9 sm:h-10 md:h-12 w-auto transition-colors ${
                useLightText ? 'text-black' : 'text-white'
              }`}
            />
          </Link>

          {/* Middle Navigation Links (desktop/tablet only) */}
          <div className="hidden lg:flex items-center gap-1 transition-opacity duration-300">
            <Link to="/">
              <Button variant="ghost" className={navLinkClass}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>

            <Link to="/projects">
              <Button variant="ghost" className={navLinkClass}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects
              </Button>
            </Link>
            <Link to="/membership">
              <Button variant="ghost" className={navLinkClass}>
                <BadgeCheck className="h-4 w-4 mr-2" />
                Membership
              </Button>
            </Link>

            {authReady && isAuthenticated && user && (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                <Button variant="ghost" className={navLinkClass}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Button>
              </Link>
            )}
          </div>

          {/* Right Side: desktop auth section + mobile menu trigger */}
          <div className="flex items-center gap-2">

            {/* Desktop/tablet auth section */}
            <div className="hidden lg:flex items-center gap-2">
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
                          : 'text-white hover:bg-white/20'
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

            {/* Mobile menu trigger + drawer */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className={`lg:hidden transition-colors ${
                    useLightText ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[85vw] sm:max-w-sm bg-white flex flex-col p-0 data-[state=open]:duration-300 data-[state=closed]:duration-200"
              >
                <SheetHeader className="border-b">
                  <SheetTitle asChild>
                    <Link to="/" className="flex items-center">
                      <LogoMark className="h-8 w-auto text-black" />
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile nav links */}
                <div className="flex flex-col gap-1 px-4 overflow-y-auto">
                  <SheetClose asChild>
                    <Link to="/">
                      <Button variant="ghost" className="w-full justify-start text-base text-black hover:bg-black/5">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/projects">
                      <Button variant="ghost" className="w-full justify-start text-base text-black hover:bg-black/5">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Projects
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/membership">
                      <Button variant="ghost" className="w-full justify-start text-base text-black hover:bg-black/5">
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        Membership
                      </Button>
                    </Link>
                  </SheetClose>
                  {authReady && isAuthenticated && user && (
                    <SheetClose asChild>
                      <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                        <Button variant="ghost" className="w-full justify-start text-base text-black hover:bg-black/5">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>

                {/* Mobile auth actions */}
                <div className="mt-auto flex flex-col gap-2 p-4 border-t">
                  {!authReady ? null : isAuthenticated ? (
                    <>
                      <div className="px-1 text-xs text-slate-500">
                        Signed in as {user?.name} · {membership.tier.replace('_', ' ')} ({membership.status})
                      </div>
                      {membership.status === 'active' && (
                        <SheetClose asChild>
                          <Link to="/member-hub">
                            <Button variant="outline" className="w-full justify-start">
                              Member hub
                            </Button>
                          </Link>
                        </SheetClose>
                      )}
                      {user?.role === 'admin' && (
                        <SheetClose asChild>
                          <Link to="/admin/memberships">
                            <Button variant="outline" className="w-full justify-start">
                              Membership admin
                            </Button>
                          </Link>
                        </SheetClose>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setMobileOpen(false);
                          handleLogout();
                        }}
                      >
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link to="/login">
                          <Button variant="outline" className="w-full">
                            Log In
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/signup">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            Join Investment
                          </Button>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

          </div>

        </div>
      </div>
    </nav>
  );
}