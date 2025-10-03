import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Home, TrendingUp, Bot, Shield } from "lucide-react";

export default function NavigationBar() {
  const [location] = useLocation();
  const { user, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Feed", href: "/", icon: Home },
    { name: "Trending", href: "#trending", icon: TrendingUp },
    { name: "AI Chat", href: "#chatbot", icon: Bot },
    ...(user?.isAdmin ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glassmorphism sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" data-testid="link-logo">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white text-xl">🤫</span>
          </div>
          <span className="text-xl font-bold gradient-text">CampusConfess.ai</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return item.href.startsWith('#') ? (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2 ${
                  location === item.href ? 'text-foreground' : ''
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium">{user.name}</span>
                {user.isPremium && (
                  <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">Premium</span>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={logout}
                className="hidden md:block"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={login}
                className="hidden md:block"
                data-testid="button-login"
              >
                Login
              </Button>
              <Button 
                onClick={login}
                className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
                data-testid="button-signup"
              >
                Sign Up
              </Button>
            </>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] glassmorphism border-border/50">
              <div className="py-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-white text-xl">🤫</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">CampusConfess.ai</span>
                  </div>
                  
                  {user && (
                    <div className="flex items-center space-x-3 p-3 bg-card/50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.college}</p>
                        {user.isPremium && (
                          <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">Premium</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return item.href.startsWith('#') ? (
                      <button
                        key={item.name}
                        onClick={() => handleNavClick(item.href)}
                        className="w-full flex items-center space-x-3 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-card/50 rounded-lg transition-colors"
                        data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-card/50 rounded-lg transition-colors ${
                          location === item.href ? 'text-foreground bg-card/50' : ''
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-6 border-t border-border/50">
                  {user ? (
                    <Button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      variant="outline"
                      className="w-full"
                      data-testid="button-mobile-logout"
                    >
                      Logout
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        onClick={() => { login(); setMobileMenuOpen(false); }}
                        variant="outline"
                        className="w-full"
                        data-testid="button-mobile-login"
                      >
                        Login
                      </Button>
                      <Button 
                        onClick={() => { login(); setMobileMenuOpen(false); }}
                        className="w-full bg-gradient-to-r from-primary to-accent text-white"
                        data-testid="button-mobile-signup"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
