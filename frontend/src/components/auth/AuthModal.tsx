import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginDemo } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1029384756-demo.apps.googleusercontent.com';

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setLoading(true);
              try {
                await loginWithGoogle({ credential: response.credential });
                onClose();
              } catch (err: any) {
                setError(err?.message || 'Google authentication failed.');
              } finally {
                setLoading(false);
              }
            }
          },
        });

        const btnElement = document.getElementById('google-official-btn-container');
        if (btnElement) {
          window.google.accounts.id.renderButton(btnElement, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'signin_with',
            shape: 'pill',
          });
        }
      } catch (err) {
        console.warn('Google Identity Services initialization warning:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = emailInput.trim().toLowerCase();

      if (!email) {
        setError('Please enter your Gmail address (@gmail.com) in the box above.');
        setLoading(false);
        return;
      }

      const isGmail = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i.test(email);
      if (!isGmail) {
        setError('Only valid Google accounts (@gmail.com or @googlemail.com) are allowed.');
        setLoading(false);
        return;
      }

      const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      await loginWithGoogle({
        email,
        name: formattedName,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        googleId: `google_${Date.now()}`,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };



  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginDemo();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Sign In / Register</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Keep your error analysis history private to your account</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 mr-1.5" /> Why Sign In?
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-500 dark:text-slate-400">
              <li>Save & sync your code error history across devices</li>
              <li>Keep your searches isolated & private from other users</li>
              <li>Guests can still use the app freely without signing up!</li>
            </ul>
          </div>

          {/* Official & Direct Google Sign In Button */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sign in with Google Account (@gmail.com):
            </label>

            <div id="google-official-btn-container" className="flex justify-center min-h-[40px] w-full"></div>

            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={handleGoogleSimulate}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign In</span>
              </button>
            </div>
          </div>


          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">Or Quick Demo</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium py-2.5 px-4 rounded-xl text-sm border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>One-Click Developer Demo Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
