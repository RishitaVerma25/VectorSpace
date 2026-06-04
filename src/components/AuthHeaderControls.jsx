import { useAuth } from '../context/AuthContext';

export const AuthHeaderControls = () => {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800">
        <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 rounded-full pl-1.5 pr-4 py-1.5 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        <img 
          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`} 
          alt={user.displayName || 'User avatar'} 
          className="w-7 h-7 rounded-full bg-slate-200"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
            {user.displayName?.split(' ')[0] || 'User'}
          </span>
          <button 
            onClick={logout}
            className="text-[9px] font-semibold text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-left transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return null;
};
