import { useEffect, useState } from 'react';

export const ContextMenu = ({ x, y, asset, workspaces, activeWorkspaceId, onClose, onAction }) => {
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);

  useEffect(() => {
    const handleClick = () => onClose();
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Prevent closing when clicking inside the menu
  const preventClose = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed z-[200] w-48 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 animate-fade-in"
      style={{ top: y, left: x }}
      onClick={preventClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 mb-1">
        <span className="text-[10px] font-black uppercase text-slate-400 block truncate">{asset.name}</span>
      </div>
      
      <button onClick={() => onAction('copy')} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center">
        <svg className="w-3.5 h-3.5 mr-2 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        Copy Value
      </button>
      
      <button onClick={() => onAction('pin')} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center">
        <svg className={`w-3.5 h-3.5 mr-2 ${asset.isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        {asset.isPinned ? 'Unpin Asset' : 'Pin Asset'}
      </button>
      
      <button onClick={() => onAction('duplicate')} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center">
        <svg className="w-3.5 h-3.5 mr-2 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6"></path><path d="M9 10h6"></path><path d="M9 18h6"></path></svg>
        Duplicate
      </button>

      {/* Move to Workspace Submenu */}
      <div 
        className="relative"
        onMouseEnter={() => setShowMoveSubmenu(true)}
        onMouseLeave={() => setShowMoveSubmenu(false)}
      >
        <button className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-3.5 h-3.5 mr-2 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            Move to...
          </div>
          <svg className="w-3 h-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        
        {showMoveSubmenu && (
          <div className="absolute top-0 left-full ml-1 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 animate-fade-in max-h-48 overflow-y-auto">
            {workspaces.filter(w => w.id !== activeWorkspaceId).map(ws => (
              <button 
                key={ws.id} 
                onClick={() => onAction('move', ws.id)} 
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ws.color || '#cbd5e1' }} />
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            {workspaces.filter(w => w.id !== activeWorkspaceId).length === 0 && (
              <div className="px-3 py-2 text-[10px] text-slate-400 text-center">No other workspaces</div>
            )}
          </div>
        )}
      </div>
      
      <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
      
      <button onClick={() => onAction('delete')} className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center">
        <svg className="w-3.5 h-3.5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Delete
      </button>
    </div>
  );
};
