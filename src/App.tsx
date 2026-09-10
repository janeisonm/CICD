/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StateProvider, useStrategicState } from './stateContext';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { TimelineTab } from './components/TimelineTab';
import { WhatIsLeftTab } from './components/WhatIsLeftTab';
import { AchievedGoalsTab } from './components/AchievedGoalsTab';
import { ReportsTab } from './components/ReportsTab';
import { ManageTab } from './components/ManageTab';
import { SystemIntelligence } from './components/SystemIntelligence';
import { GoogleDriveBanner } from './components/GoogleDriveSync';
import { GlobalSearch } from './components/GlobalSearch';
import { UserSwitcher } from './components/UserSwitcher';
import { LoginScreen } from './components/LoginScreen';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { state, currentUser, setActiveTab } = useStrategicState();

  if (state.isLoggedIn === false) {
    return <LoginScreen />;
  }

  const logoUrl = state.systemSettings?.logoUrl;
  const coordinatorRole = currentUser?.roleTitle || state.systemSettings?.coordinatorRole || 'Coordenador de Inovação e Culturas Digitais';

  const isTabAllowed = (tabId: string) => {
    if (!currentUser || currentUser.role === 'administrador') return true;
    return (currentUser.allowedTabs || []).includes(tabId as any);
  };

  const renderActiveTab = () => {
    if (!isTabAllowed(state.activeTab)) {
      return (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-10 text-center space-y-4 shadow-2xl max-w-xl mx-auto my-12 animate-fade-in" id="restricted-access-banner">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">Acesso Restrito ao Módulo</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Olá, <strong className="text-emerald-400">{currentUser?.name}</strong> ({currentUser?.roleTitle}). 
            Este módulo não está liberado nas suas permissões de acesso da coordenadoria.
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Solicite ao Administrador da Coordenadoria a liberação desta guia no menu "Equipe & Permissões".
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md inline-block mt-2"
          >
            Voltar ao Dashboard
          </button>
        </div>
      );
    }

    switch (state.activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'timeline':
        return <TimelineTab />;
      case 'pending':
        return <WhatIsLeftTab />;
      case 'achieved':
        return <AchievedGoalsTab />;
      case 'reports':
        return <ReportsTab />;
      case 'manage':
        return <ManageTab />;
      default:
        return <DashboardTab />;
    }
  };

  const getTabTitle = () => {
    switch (state.activeTab) {
      case 'dashboard': return 'Dashboard Executivo';
      case 'timeline': return 'Linha do Tempo';
      case 'pending': return 'Agenda - "O Que Falta Fazer"';
      case 'achieved': return 'Painel de Objetivos Alcançados';
      case 'reports': return 'Relatórios Gerenciais';
      case 'manage': return 'Módulo de Gestão de Dados';
      default: return 'Plataforma Estratégica';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-green-950 text-slate-100 flex flex-col lg:flex-row font-sans" id="app-root-container">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="flex-1 lg:pl-64 min-w-0 transition-all duration-300" id="main-content-area">
        
        {/* DESKTOP TOP BAR HEADER */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 text-white sticky top-0 z-20 border-b border-emerald-800/60 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Registered Logo or Brand Badge */}
            {logoUrl ? (
              <div 
                className="relative group cursor-pointer bg-white p-2 rounded-2xl border border-emerald-300/80 shadow-md hover:border-emerald-500 transition-all flex items-center justify-center shrink-0 min-w-12" 
                onClick={() => setActiveTab('manage')} 
                title="Clique para alterar a logo nas Configurações"
              >
                <img 
                  src={logoUrl} 
                  alt="Logo Cadastrada" 
                  className="max-h-14 max-w-[200px] w-auto h-auto object-contain rounded-lg" 
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-full border border-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit
                </span>
              </div>
            ) : (
              <div 
                onClick={() => setActiveTab('manage')}
                className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center font-black text-emerald-800 text-xl shadow-md border border-emerald-400/80 cursor-pointer hover:scale-105 transition-transform"
                title="Clique para cadastrar sua Logo"
              >
                C
              </div>
            )}

            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                {getTabTitle()}
              </h1>
              <p className="text-xs text-emerald-300 font-medium italic mt-0.5 flex items-center gap-1.5">
                <span>SME Crateús</span>
                <span>•</span>
                <span>{coordinatorRole}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* USER SWITCHER & ACTIVE USER PROFILE */}
            <UserSwitcher />

            {/* GLOBAL SEARCH FIELD */}
            <GlobalSearch />

            <div className="hidden xl:flex items-center gap-2 text-xs font-mono font-bold text-emerald-200 bg-emerald-900/40 px-3.5 py-2 rounded-2xl border border-emerald-700/50 shadow-2xs">
              <span>SME</span>
              <span className="h-3 w-px bg-emerald-700"></span>
              <span className="text-emerald-400">2026</span>
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
          
          {/* GOOGLE DRIVE CLOUD SYNC BANNER */}
          <GoogleDriveBanner />

          {/* SYSTEM INTELLIGENCE ANALYTICS ACCORDION - ALWAYS ACCESSIBLE AT TOP */}
          <SystemIntelligence />

          {/* ACTIVE SELECTED TAB PANEL */}
          <div className="animate-fade-in" id="active-tab-panel">
            {renderActiveTab()}
          </div>

        </div>

      </main>
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}
