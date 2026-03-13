import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Atom, Mail, Lock, User, ArrowRight, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GLSLHills } from "@/components/ui/glsl-hills";
import { djangoClient } from "@/integrations/django/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast.error(t('auth.passMatch'));
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        // Login
        const response = await djangoClient.login({
          username: email, // Using email as username
          password: password,
        });
        toast.success(`${t('auth.welcome')}, ${response.user.username}!`);
        navigate("/");
      } else {
        // Register
        const response = await djangoClient.register({
          username: email, // Use full email as username for consistency
          email: email,
          password: password,
          password_confirm: confirmPassword,
          first_name: name.split(" ")[0] || "",
          last_name: name.split(" ").slice(1).join(" ") || "",
        });
        toast.success(`${t('auth.accountCreated')} ${t('auth.welcome')}, ${response.user.username}!`);
        navigate("/");
      }
    } catch (error) {
      let errorMessage = t('auth.authFailed');
      if (error instanceof Error) {
        // If backend returned JSON string like {"username":["..."]}, parse and extract message
        try {
          const parsed = JSON.parse(error.message);
          // parsed is likely an object of arrays; get first message available
          const firstKey = Object.keys(parsed)[0];
          const val = parsed[firstKey];
          if (Array.isArray(val) && val.length) {
            errorMessage = val[0];
          } else if (typeof val === 'string') {
            errorMessage = val;
          } else {
            errorMessage = JSON.stringify(parsed);
          }
        } catch (e) {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAcceptTerms(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const passwordRequirements = [
    { label: t('auth.passReq8'), met: password.length >= 8 },
    { label: t('auth.passReqUpper'), met: /[A-Z]/.test(password) },
    { label: t('auth.passReqNum'), met: /[0-9]/.test(password) },
  ];

  const isSignupValid = acceptTerms && password === confirmPassword && passwordRequirements.every(r => r.met);

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* GLSL Hills Background */}
      <div className="fixed inset-0 z-0">
        <GLSLHills speed={0.3} cameraZ={150} />
      </div>

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all duration-300 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm">Home</span>
      </Link>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-8 group relative z-10">
        <div className="relative">
          <Atom className="w-10 h-10 text-primary transition-all duration-300 group-hover:rotate-180" />
          <div className="absolute inset-0 blur-md bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-display text-2xl font-bold tracking-wider text-foreground">
          Beyond<span className="text-primary text-glow">Lab</span>
        </span>
      </Link>

      {/* Mode Toggle */}
      <div className="relative z-10 mb-6 flex bg-muted/30 backdrop-blur-sm rounded-lg p-1 border border-border/30">
        <button
          type="button"
          onClick={() => { if (!isLogin) toggleMode(); }}
          className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${isLogin
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          {t('auth.signIn')}
        </button>
        <button
          type="button"
          onClick={() => { if (isLogin) toggleMode(); }}
          className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${!isLogin
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          {t('auth.signUp')}
        </button>
      </div>

      <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border/50 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg pointer-events-none" />

        <CardHeader className="space-y-1 text-center relative">
          <CardTitle className="text-2xl font-display tracking-wide">
            {isLogin ? t('auth.welcomeBack') : t('auth.joinLab')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin
              ? t('auth.loginQuote')
              : t('auth.signupQuote')
            }
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 relative">
            {/* Name field - only for signup */}
            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="name" className="text-foreground/80">{t('auth.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="scientist@beyondlab.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80">{t('auth.password')}</Label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
              {!isLogin && password && (
                <div className="space-y-1 pt-2 animate-in fade-in duration-200">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {req.met && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`transition-colors ${req.met ? 'text-primary' : 'text-muted-foreground'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password - only for signup */}
            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="confirmPassword" className="text-foreground/80">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors ${confirmPassword && password !== confirmPassword ? 'border-destructive' : ''
                      }`}
                    required={!isLogin}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive animate-in fade-in duration-200">{t('auth.passMatch')}</p>
                )}
              </div>
            )}

            {/* Terms checkbox - only for signup */}
            {!isLogin && (
              <div className="flex items-start space-x-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-0.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  {t('auth.agreeTerms')}{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                    {t('auth.terms')}
                  </Link>{" "}
                  {t('auth.and')}{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                    {t('auth.privacy')}
                  </Link>
                </label>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 relative">
            <Button
              type="submit"
              className="w-full group bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              disabled={isLoading || (!isLogin && !isSignupValid)}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t('auth.accessLab') : t('auth.createAccount')}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('auth.orContinue')} {isLogin ? "continue" : "sign up"} with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="bg-background/30 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-background/30 border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {isLogin ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

export default Auth;
