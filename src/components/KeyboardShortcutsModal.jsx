import { useEffect } from 'react';

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    {
      group: 'Navigation',
      items: [
        { keys: ['/'], label: 'Spotlight Search' },
        { keys: ['?'], label: 'Show Keyboard Shortcuts' },
        { keys: ['↑', '↓', '←', '→'], label: 'Navigate Assets' },
        { keys: ['Esc'], label: 'Close Modals / Deselect' }
      ]
    },
    {
      group: 'Asset Actions',
      items: [
        { keys: ['Enter'], label: 'Edit Selected Asset' },
        { keys: ['Del'], label: 'Delete Selected Asset' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700/50">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {shortcuts.map((section) => (
            <div key={section.group}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{section.group}</h3>
              <div className="space-y-3">
                {section.items.map((shortcut, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{shortcut.label}</span>
                    <div className="flex space-x-1.5">
                      {shortcut.keys.map((key, i) => (
                        <kbd key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
