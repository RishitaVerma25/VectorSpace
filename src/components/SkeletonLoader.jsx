
export const SkeletonCard = ({ isList }) => (
  <div className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm relative overflow-hidden ${isList ? 'flex flex-row items-center space-x-4' : 'flex flex-col'}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent z-10" />
    
    <div className={`flex justify-between items-start ${isList ? 'w-1/3 mb-0' : 'mb-3'}`}>
      <div className="space-y-2 w-full">
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800/50 rounded"></div>
      </div>
      {!isList && <div className="h-5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>}
    </div>

    <div className={`flex flex-col justify-end ${isList ? 'w-2/3' : 'mt-4'}`}>
      <div className={`w-full ${isList ? 'h-6' : 'h-14 mb-2'} bg-slate-200 dark:bg-slate-800 rounded-xl`}></div>
      {!isList && (
        <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
      )}
    </div>
  </div>
);

export const SkeletonSidebar = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 w-full p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl">
        <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    ))}
    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
      <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
      <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
    </div>
  </div>
);

export const SkeletonInspector = () => (
  <div className="p-6 rounded-3xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-6 animate-pulse">
    <div className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
      <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
      <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
    </div>
    <div className="space-y-4">
      <div>
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
      </div>
      <div>
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-20 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
      </div>
    </div>
  </div>
);
