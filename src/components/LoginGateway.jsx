import { useAuth } from '../context/AuthContext';
import VectorSpaceLogo from './VectorSpaceLogo';

export const LoginGateway = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans relative overflow-hidden">
      
      {/* Animated Flowing Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900 bg-gradient-flow opacity-80" />
      
      {/* Fake Dashboard Grid Preview (Blurred) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 blur-sm flex justify-center items-center scale-110">
        <div className="w-[1200px] h-[800px] border border-slate-800 rounded-3xl grid grid-cols-4 gap-4 p-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-2xl h-32 border border-slate-700/50 flex flex-col justify-end p-4">
              <div className="w-full h-2 bg-slate-700 rounded-full mb-2"></div>
              <div className="w-2/3 h-2 bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-4xl bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-up">
        
        {/* Left Side: Branding & Features */}
        <div className="w-full md:w-1/2 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col justify-between">
          <div>
            <VectorSpaceLogo width={56} height={56} className="mb-8 transform hover:rotate-12 transition-transform duration-500" />
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              VectorSpace
            </h1>
            <p className="text-slate-400 text-sm md:text-base mb-8 font-medium leading-relaxed">
              The premium design token vault. Secure client-side asset tokens, color harmonies, and vector canvas sandboxes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
              </div>
              <span className="text-sm font-semibold">Color Tokens & Harmonies</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <span className="text-sm font-semibold">Vector Graphics Library</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <span className="text-sm font-semibold">Real-time Cloud Sync</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Action */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center bg-slate-900/40 relative">
          
          <div className="text-center w-full max-w-sm">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm mb-10">Sign in to access your unified design system registry across all devices.</p>
            
            <button
              onClick={loginWithGoogle}
              className="group relative flex items-center justify-center space-x-3 w-full bg-white text-slate-900 font-bold text-sm px-6 py-4 rounded-2xl hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              <span className="tracking-wide text-base">Continue with Google</span>
            </button>
            
            <p className="mt-8 text-[10px] text-slate-500 font-medium">
              By continuing, you agree to our Terms of Service and Privacy Policy. Secure authentication provided by Firebase.
            </p>
          </div>
        </div>

      </div>

      {/* Footer minimal tag */}
      <div className="absolute bottom-6 text-[10px] text-slate-500/50 font-mono tracking-widest uppercase z-10">
        Enterprise Authentication Node &bull; v2.0
      </div>
    </div>
  );
};
