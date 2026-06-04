
export const ToastContainer = ({ toasts, removeToast, confirmDialog }) => {
  return (
    <>
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 min-w-[250px] animate-slide-in">
            {toast.type === 'success' && <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
            {toast.type === 'error' && <svg className="text-rose-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
            {toast.type === 'info' && <svg className="text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
            <span className="flex-1 text-sm font-semibold">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ))}
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <svg className="text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              Confirmation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end space-x-3">
              <button onClick={confirmDialog.onCancel} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-md transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
