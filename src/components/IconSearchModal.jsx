import { useState, useEffect, useRef } from 'react';

export default function IconSearchModal({ isOpen, onClose, onSelectIcon }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Preferred libraries for cleaner UI results
  const PREFERRED_PREFIXES = ['lucide', 'heroicons', 'ph', 'mdi', 'tabler'];

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 400);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      // Using Iconify API
      const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(searchQuery)}&limit=90`);
      if (!res.ok) throw new Error('Failed to fetch icons');
      const data = await res.json();
      
      if (data.icons) {
        // Sort to prioritize preferred libraries
        const sortedIcons = data.icons.sort((a, b) => {
          const aPrefix = a.split(':')[0];
          const bPrefix = b.split(':')[0];
          const aPrefIndex = PREFERRED_PREFIXES.indexOf(aPrefix);
          const bPrefIndex = PREFERRED_PREFIXES.indexOf(bPrefix);
          
          if (aPrefIndex !== -1 && bPrefIndex === -1) return -1;
          if (aPrefIndex === -1 && bPrefIndex !== -1) return 1;
          if (aPrefIndex !== -1 && bPrefIndex !== -1) return aPrefIndex - bPrefIndex;
          return 0;
        });
        setResults(sortedIcons);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Could not connect to the Icon Library API. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (iconId) => {
    setIsLoading(true);
    try {
      const [prefix, name] = iconId.split(':');
      const res = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`);
      if (!res.ok) throw new Error('Failed to download SVG');
      
      let svgText = await res.text();
      
      // Clean up XML declaration if present
      svgText = svgText.replace(/<\?xml.*\?>/g, '').trim();
      
      onSelectIcon(svgText, name);
      onClose();
    } catch (err) {
      alert('Failed to load full SVG data.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden">
        
        {/* Header & Search */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <svg className="text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Icon Library Search</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Search thousands of native SVGs from Lucide, Heroicons, Phosphor & more.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons (e.g. 'user', 'settings', 'arrow')..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-sm"
            />
            {isLoading && (
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
            )}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/50">
          {error && (
            <div className="text-center py-10 text-red-500 font-bold text-sm">
              {error}
            </div>
          )}

          {!query && !error && (
             <div className="text-center py-20 flex flex-col items-center justify-center opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                <p className="font-bold text-slate-700 dark:text-slate-300">Type to start searching...</p>
             </div>
          )}

          {query && !isLoading && results.length === 0 && !error && (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-medium text-sm">
              No icons found for "{query}". Try a different keyword.
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {results.map((iconId) => {
                const [prefix] = iconId.split(':');
                return (
                  <button
                    key={iconId}
                    onClick={() => handleSelect(iconId)}
                    disabled={isLoading}
                    className="group flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[var(--accent)] hover:shadow-[0_0_15px_var(--accent-light)] transition-all cursor-pointer aspect-square"
                    title={iconId}
                  >
                    <div className="flex-1 w-full flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-[var(--accent)] group-hover:scale-110 transition-transform">
                       <img 
                          src={`https://api.iconify.design/${iconId.replace(':', '/')}.svg?color=currentColor`} 
                          className="w-8 h-8"
                          style={{ filter: 'var(--tw-invert, invert(0)) opacity(0.7)' /* basic theme adapting */ }}
                          alt={iconId} 
                       />
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-wider truncate w-full text-center">
                      {prefix}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
