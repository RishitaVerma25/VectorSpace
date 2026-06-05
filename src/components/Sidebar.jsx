import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SkeletonSidebar } from './SkeletonLoader';

export const Sidebar = () => {
  const {
    workspaces,
    setWorkspaces,
    assets,
    setAssets,
    activeWorkspaceId,
    setActiveWorkspaceId,
    setSelectedAssetId,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    shareWorkspaceWithEmail,
    isCloudSyncing,
    activeTypeFilter,
    setActiveTypeFilter,
    setIsImageTracerOpen,
    setIsHelpGuideOpen,
    folders,
    setFolders,
    activeFolderId,
    setActiveFolderId
  } = useAppContext();

  const { showConfirm } = useToast();

  const [newWsName, setNewWsName] = useState('');
  const [newWsColor, setNewWsColor] = useState('#005F73');
  const [editingWsId, setEditingWsId] = useState(null);
  const [editWsName, setEditWsName] = useState('');
  const [sharingWsId, setSharingWsId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  
  const [newFolderName, setNewFolderName] = useState('');
  
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newId = `folder-${Date.now()}`;
    setFolders([...folders, { id: newId, workspaceId: activeWorkspaceId, name: newFolderName }]);
    setNewFolderName('');
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (await showConfirm('Delete this folder? (Assets will not be deleted, just removed from the folder)')) {
      setFolders(folders.filter(f => f.id !== id));
      // Optionally update assets to remove folderId, but our filter logic won't show them if folder is gone anyway,
      // actually if the folder is gone, they'll just have a dead folderId and won't show up. 
      // We should remove folderId from assets.
      setAssets(assets.map(a => a.folderId === id ? { ...a, folderId: null } : a));
      if (activeFolderId === id) setActiveFolderId(null);
    }
  };

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const newId = `ws-${Date.now()}`;
    setWorkspaces([...workspaces, { id: newId, name: newWsName, description: 'Client isolated primitives vault.', color: newWsColor }]);
    setNewWsName('');
    setActiveWorkspaceId(newId);
    setIsSidebarOpen(false);
  };

  const handleDeleteWorkspace = async (id, e) => {
    e.stopPropagation();
    if (await showConfirm('Delete this workspace and all associated design tokens permanently?')) {
      setWorkspaces(workspaces.filter(w => w.id !== id));
      setAssets(assets.filter(a => a.workspaceId !== id));
      if (activeWorkspaceId === id) {
        setActiveWorkspaceId(workspaces[0]?.id !== id ? workspaces[0]?.id : (workspaces[1]?.id || ''));
        setSelectedAssetId(null);
      }
    }
  };

  const handleSaveEditWorkspace = (id, e) => {
    e.preventDefault();
    setWorkspaces(workspaces.map(w => w.id === id ? { ...w, name: editWsName } : w));
    setEditingWsId(null);
  };

  const handleShareSubmit = async (id, e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    const success = await shareWorkspaceWithEmail(id, shareEmail);
    if (success) {
      setSharingWsId(null);
      setShareEmail('');
    }
  };

  const handleTogglePinWorkspace = (id, e) => {
    e.stopPropagation();
    setWorkspaces(workspaces.map(w => w.id === id ? { ...w, isPinned: !w.isPinned } : w));
  };

  const colSpanClass = isSidebarCollapsed ? 'lg:col-span-1 lg:max-w-[80px]' : 'lg:col-span-3';

  const sortedWorkspaces = [...workspaces].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const getWorkspaceStats = (wsId) => {
    const wsAssets = assets.filter(a => a.workspaceId === wsId);
    const colors = wsAssets.filter(a => a.type === 'color').length;
    const svgs = wsAssets.filter(a => a.type === 'svg').length;
    const gradients = wsAssets.filter(a => a.type === 'gradient').length;
    return `${colors} colors · ${svgs} SVGs · ${gradients} gradients`;
  };

  const FILTER_TABS = [
    { label: 'All Assets', value: 'All' },
    { label: 'Colors', value: 'Colors', typeMatch: 'color' },
    { label: 'SVGs', value: 'SVG', typeMatch: 'svg' },
    { label: 'Gradients', value: 'Gradient', typeMatch: 'gradient' },
    { label: 'Typography', value: 'Typography', typeMatch: 'typography' },
    { label: 'Images', value: 'Image', typeMatch: 'image' },
    { label: 'Code', value: 'Code', typeMatch: 'code' },
    { label: 'Pinned', value: 'Pinned' }
  ];

  const getFilterCount = (filter) => {
    const wsAssets = assets.filter(a => a.workspaceId === activeWorkspaceId);
    if (filter.value === 'All') return wsAssets.length;
    if (filter.value === 'Pinned') return wsAssets.filter(a => a.isPinned).length;
    return wsAssets.filter(a => a.type === filter.typeMatch).length;
  };

  if (isCloudSyncing) {
    return (
      <aside className={`glass-sidebar ${isSidebarOpen ? 'flex z-40 absolute inset-0 p-6' : 'hidden'} lg:flex lg:static ${colSpanClass} flex-col justify-between rounded-3xl p-6 shadow-sm transition-all duration-300`}>
        <SkeletonSidebar />
      </aside>
    );
  }

  return (
    <aside id="aside-tour" className={`glass-sidebar ${isSidebarOpen ? 'flex z-40 absolute inset-0 p-6' : 'hidden'} lg:flex lg:static ${colSpanClass} flex-col justify-between rounded-3xl ${isSidebarCollapsed ? 'p-3 items-center' : 'p-6'} shadow-sm transition-all duration-300 overflow-hidden`}>
      <div className={`space-y-6 w-full ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex justify-between items-center mb-4 ${isSidebarCollapsed ? 'flex-col space-y-4' : ''}`}>
          {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Environments</span>}
          <div className="flex space-x-2">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isSidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
              )}
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
        </div>

        {/* Workspaces Lists */}
        <div className={`space-y-1.5 max-h-[35vh] overflow-y-auto ${isSidebarCollapsed ? 'w-full flex flex-col items-center no-scrollbar' : 'pr-1'}`}>
          {sortedWorkspaces.map((ws, index) => (
            <React.Fragment key={ws.id}>
              {/* Optional divider between pinned and unpinned */}
              {index > 0 && !ws.isPinned && sortedWorkspaces[index - 1].isPinned && !isSidebarCollapsed && (
                <div className="border-t border-slate-200 dark:border-slate-700/50 my-2 mx-2"></div>
              )}
              <div className={`relative group flex flex-col space-y-1 ${isSidebarCollapsed ? 'w-full' : ''}`}>
                {editingWsId === ws.id && !isSidebarCollapsed ? (
                  <form onSubmit={(e) => handleSaveEditWorkspace(ws.id, e)} className="flex items-center space-x-2 w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                    <input autoFocus type="text" value={editWsName} onChange={(e) => setEditWsName(e.target.value)} className="w-full bg-transparent border-0 rounded px-2 py-1 text-sm text-slate-800 dark:text-slate-100 focus:outline-none" />
                    <button type="submit" className="text-emerald-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                  </form>
                ) : sharingWsId === ws.id && !isSidebarCollapsed ? (
                  <form onSubmit={(e) => handleShareSubmit(ws.id, e)} className="flex items-center space-x-2 w-full p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                    <input autoFocus type="email" placeholder="Enter user's email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="w-full bg-transparent border-0 rounded px-2 py-1 text-[10px] text-slate-800 dark:text-slate-100 focus:outline-none" />
                    <button type="button" onClick={() => setSharingWsId(null)} className="text-slate-400 hover:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    <button type="submit" className="text-[var(--accent)]"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
                  </form>
                ) : (
                  <button
                    onClick={() => { setActiveWorkspaceId(ws.id); setSelectedAssetId(null); setIsSidebarOpen(false); }}
                    className={`w-full text-left ${isSidebarCollapsed ? 'p-3 flex justify-center' : 'px-4 py-3'} text-sm transition-all flex items-center justify-between ${isSidebarCollapsed ? 'rounded-xl mb-2' : 'rounded-2xl'} ${activeWorkspaceId === ws.id
                      ? 'bg-[var(--accent-light)] text-[var(--accent)] font-bold shadow-sm ring-1 ring-[var(--accent-ring)]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-950 dark:hover:text-slate-100'
                      }`}
                    title={isSidebarCollapsed ? ws.name : undefined}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 truncate'}`}>
                      <span className={`rounded-full flex-shrink-0 ${isSidebarCollapsed ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ backgroundColor: ws.color || '#cbd5e1' }} />
                      {!isSidebarCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate group-hover:translate-x-1 transition-transform flex items-center space-x-1.5">
                            <span>{ws.name}</span>
                            {ws.isPinned && <span className="text-amber-400"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">{getWorkspaceStats(ws.id)}</span>
                        </div>
                      )}
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span onClick={(e) => handleTogglePinWorkspace(ws.id, e)} className={`${ws.isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`} title={ws.isPinned ? "Unpin" : "Pin Workspace"}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={ws.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
                        <span onClick={(e) => { e.stopPropagation(); setSharingWsId(ws.id); setShareEmail(''); }} className="text-slate-400 hover:text-[var(--accent)]" title="Share via Email"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></span>
                        <span onClick={(e) => { e.stopPropagation(); setEditingWsId(ws.id); setEditWsName(ws.name); }} className="text-slate-400 hover:text-[var(--accent)]"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></span>
                        <span onClick={(e) => handleDeleteWorkspace(ws.id, e)} className="text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Workspace Folders */}
        {!isSidebarCollapsed && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-1 mt-4">
            <div className="flex justify-between items-center mb-2 ml-1 pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Folders</span>
            </div>
            
            <div className="space-y-0.5 max-h-[15vh] overflow-y-auto pr-1 custom-scrollbar">
              <button
                onClick={() => { setActiveFolderId(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${!activeFolderId
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                <span>All Assets</span>
              </button>
              
              {folders.filter(f => f.workspaceId === activeWorkspaceId).map(folder => (
                <div key={folder.id} className="group relative flex items-center">
                  <button
                    onClick={() => { setActiveFolderId(folder.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${activeFolderId === folder.id
                        ? 'bg-[var(--accent-light)] text-[var(--accent)] dark:bg-[var(--accent-light)] dark:text-[var(--accent)]'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      <span className="truncate">{folder.name}</span>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteFolder(folder.id, e)} 
                    className="absolute right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateFolder} className="mt-2 px-1">
              <input
                type="text"
                placeholder="+ New folder..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] transition-all"
              />
            </form>
          </div>
        )}

        {/* Library Filters */}
        {!isSidebarCollapsed && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50 space-y-1 mt-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block ml-1 mb-2">Library Filters</span>
            <div className="space-y-0.5 max-h-[25vh] overflow-y-auto pr-1 custom-scrollbar">
              {FILTER_TABS.map(tab => {
                const count = getFilterCount(tab);
                const isActive = activeTypeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => { setActiveTypeFilter(tab.value); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isActive
                          ? 'bg-[var(--accent-light)] text-[var(--accent)] dark:bg-[var(--accent-light)] dark:text-[var(--accent)]'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                        }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isSidebarCollapsed && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50 mt-6 space-y-3">
            <button
              onClick={() => setIsImageTracerOpen(true)}
              className="w-full flex items-center justify-between bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-[var(--accent-ring)] active:scale-95 group"
            >
              <div className="flex items-center space-x-2">
                <svg className="group-hover:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <span>Image-to-SVG Converter</span>
              </div>
            </button>
            <button
              onClick={() => setIsHelpGuideOpen(true)}
              className="w-full flex items-center justify-between bg-[#94D2BD]/20 hover:bg-[#94D2BD]/35 dark:bg-[#94D2BD]/10 dark:hover:bg-[#94D2BD]/20 text-[#1A252C] dark:text-[#94D2BD] text-sm font-bold py-3 px-4 rounded-xl transition-all active:scale-95 group"
            >
              <div className="flex items-center space-x-2">
                <svg className="group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>Help & Guides</span>
              </div>
            </button>
          </div>
        )}

        {/* Mount New Workspace Form */}
        {!isSidebarCollapsed && (
          <form onSubmit={handleCreateWorkspace} className="pt-6 border-t border-slate-200 dark:border-slate-700/50 space-y-3 mt-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block ml-1">New System</span>
            <div className="flex space-x-2">
              <input type="color" value={newWsColor} onChange={(e) => setNewWsColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0" />
              <input
                type="text" placeholder="Workspace name..." value={newWsName} onChange={(e) => setNewWsName(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] transition-all"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-[var(--accent)] text-white dark:bg-slate-700 dark:hover:bg-[var(--accent)] text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
              Mount System Registry
            </button>
          </form>
        )}
      </div>

      {!isSidebarCollapsed && (
        <div className="hidden lg:block text-xs text-slate-400 dark:text-slate-500 space-y-2 border-t border-slate-200 dark:border-slate-700/50 pt-5 mt-6 ml-1">
          <p className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-2"></span> Local Encoded Core Pool</p>
        </div>
      )}
    </aside>
  );
};
