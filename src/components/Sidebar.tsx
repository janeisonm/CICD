import React from 'react';
import { useStrategicState } from '../stateContext';
import { GlobalSearch } from './GlobalSearch';
import { 
  Award, BarChart3, Clock, FileText, Landmark, LayoutDashboard, 
  Menu, Sliders, Trophy, X, UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { state, currentUser, setActiveTab } = useStrategicState();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard Executivo', icon: LayoutDashboard },
    { id: 'timeline' as const, label: 'Linha do Tempo', icon: Clock },
    { id: 'pending' as const, label: 'O Que Falta Fazer', icon: Award },
    { id: 'achieved' as const, label: 'Objetivos Alcançados', icon: Trophy },
    { id: 'reports' as const, label: 'Relatórios Gerenciais', icon: FileText },
    { id: 'manage' as const, label: 'Gestão de Dados', icon: Sliders },
  ];

  const allowedNavItems = navItems.filter(item => {
    if (!currentUser || currentUser.role === 'administrador') return true;
    return (currentUser.allowedTabs || []).includes(item.id);
  });

  const logoUrl = state.systemSettings?.logoUrl;
  const loggedUserName = currentUser?.name || state.systemSettings?.coordinatorName || 'Prof. Francisco Reginaldo';
  const loggedUserRole = currentUser?.roleTitle || state.systemSettings?.coordinatorRole || 'Coordenador de Inovação';

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="lg:hidden bg-gradient-to-r from-emerald-950 via-slate-950 to-green-950 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-emerald-900/60">
        <div className="flex items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg bg-white/10 p-0.5 border border-emerald-500/40" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-800 rounded-lg flex items-center justify-center font-black text-white text-xs border border-emerald-400/30">
              C
            </div>
          )}
          <div>
            <h1 className="text-xs font-extrabold tracking-tight text-white leading-none">Gestão Estratégica</h1>
            <p className="text-[9px] text-emerald-300 font-bold uppercase mt-0.5">{loggedUserName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GlobalSearch isMobile />

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-emerald-900/60 rounded-lg text-emerald-200 transition-colors cursor-pointer border border-emerald-800/50"
            id="mobile-menu-toggle"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" onClick={() => setIsOpen(false)}>
          <div 
            className="w-64 max-w-[80%] h-full bg-gradient-to-b from-emerald-950 via-slate-950 to-green-950 text-white p-6 flex flex-col gap-4 shadow-2xl border-r border-emerald-900/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 border-b border-emerald-900/60 pb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 border border-emerald-500/40 shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-800 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 border border-emerald-400/30">
                  C
                </div>
              )}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-tight text-slate-100 leading-tight">Coordenadoria de Inovação<br/>e Culturas Digitais</h2>
                <p className="text-[9px] text-emerald-400 font-semibold uppercase mt-0.5">SME Crateús</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1">
              {allowedNavItems.map(item => {
                const Icon = item.icon;
                const isActive = state.activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-xs' 
                        : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
                    }`}
                    id={`mobile-nav-${item.id}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="text-[10px] text-emerald-400/80 font-mono text-center border-t border-emerald-900/60 pt-4 space-y-0.5">
              <p className="font-bold text-slate-200">{loggedUserName}</p>
              <p className="text-[9px] text-emerald-500">{loggedUserRole}</p>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 h-screen bg-gradient-to-b from-emerald-950 via-slate-950 to-green-950 text-white p-6 flex-col justify-between fixed left-0 top-0 z-30 shadow-2xl border-r border-emerald-900/60" id="desktop-sidebar">
        
        <div className="space-y-6">
          {/* Brand logo */}
          <div className="flex items-center gap-3 border-b border-emerald-900/60 pb-5">
            {logoUrl ? (
              <div className="bg-white p-1 rounded-xl border border-emerald-400/50 shadow-sm shrink-0 flex items-center justify-center">
                <img src={logoUrl} alt="Logo Coordenadoria" className="max-h-10 max-w-[100px] w-auto h-auto object-contain rounded-lg" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-emerald-800 text-base shrink-0 border border-emerald-400/40 shadow-sm">
                C
              </div>
            )}
            <div>
              <h1 className="text-xs font-bold uppercase tracking-tight text-slate-100 leading-tight">Coordenadoria de Inovação<br/>e Culturas Digitais</h1>
              <p className="text-[9px] text-emerald-400 font-bold uppercase mt-0.5">SME Crateús</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {allowedNavItems.map(item => {
              const Icon = item.icon;
              const isActive = state.activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-emerald-900/30 font-medium'
                  }`}
                  id={`desktop-nav-${item.id}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Coordenadoria footer indicator with logged user name */}
        <div className="border-t border-emerald-900/60 pt-4 bg-emerald-950/40 -mx-2 p-3 rounded-2xl border border-emerald-900/40">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase font-extrabold text-emerald-400 tracking-wider truncate">Usuário Conectado</p>
              <p className="text-[11px] font-bold text-slate-100 truncate">{loggedUserName}</p>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-mono text-center pt-1 border-t border-emerald-900/40">
            © 2026 SME Crateús • CE
          </p>
        </div>

      </aside>
    </>
  );
};
