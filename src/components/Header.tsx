import { Atom } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { djangoClient } from "@/integrations/django/client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(djangoClient.getUser());
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for user in localStorage on mount and when tab regains focus
  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Check when tab regains focus
    window.addEventListener('focus', checkUser);
    return () => window.removeEventListener('focus', checkUser);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'al' : 'en');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${isScrolled ? "bg-black" : ""} animate-fade-in-down`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <Atom className="w-8 h-8 text-primary transition-all duration-300 group-hover:rotate-180" />
            <div className="absolute inset-0 blur-md bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider text-foreground">
            Beyond<span className="text-primary text-glow">Lab</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t('nav.home')}
          </a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t('nav.about')}
          </a>
          <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t('nav.services')}
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t('nav.features')}
          </a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            {t('nav.contact')}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 mr-2"
          >
            <Globe className="w-4 h-4" />
            <span className="font-semibold">{language.toUpperCase()}</span>
          </Button>

          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {t('nav.welcome')}, <span className="font-semibold text-foreground">{user.first_name || user.username}</span>
              </span>
              <Button
                variant="ghost"
                onClick={() => {
                  djangoClient.clearToken();
                  setUser(null);
                  navigate("/");
                  window.location.reload();
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/auth">{t('nav.signup')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
