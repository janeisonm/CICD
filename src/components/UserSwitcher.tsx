import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { UserProfileModal } from './UserProfileModal';
import { UserCheck, ShieldCheck, ChevronDown, Edit2, Users, UserPlus, LogOut } from 'lucide-react';

export const UserSwitcher: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { state, currentUser, setCurrentUserId, setActiveTab, logout } = useStrategicState();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const teamUsers = state.teamUsers || [];

  return (
    <>
      <div className="relative inline-block text-left" id="user-switcher-container">
        <div className="flex items-center gap-1.5">
          {/* Main User Profile Button with Explicit User Label */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2.5 bg-gradient-to-r from-emerald-900/90 to-emerald-950 hover:from-emerald-800 hover:to-emerald-900 border-2 border-emerald-500/70 text-white rounded-2xl shadow-md transition-all cursor-pointer ${
              compact ? 'px-3 py-1.5' : 'px-4 py-2'
            }`}
            id="btn-user-switcher"
            title={`Usuário conectado: ${currentUser?.name} (${currentUser?.roleTitle}). Clique para alterar.`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center text-white font-black text-xs shadow-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" title="Sessão Ativa"></span>
            </div>

            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase text-emerald-300 tracking-wider bg-emerald-800/80 px-1.5 py-0.5 rounded-md border border-emerald-500/40">
                  USUÁRIO ATIVO
                </span>
                {currentUser?.role === 'administrador' && (
                  <span className="text-[9px] font-extrabold uppercase text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-0.5">
                    <ShieldCheck className="h-2.5 w-2.5 text-amber-300" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs font-black text-white mt-0.5 leading-tight truncate max-w-[200px]">
                {currentUser?.name}
              </p>
              <p className="text-[10px] text-emerald-200/90 leading-tight truncate max-w-[200px] font-medium">
                {currentUser?.roleTitle}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-emerald-300 shrink-0 ml-1" />
          </button>

          {/* Quick Edit My Profile Button */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="text-[10px] text-emerald-300 hover:text-white bg-emerald-800/80 hover:bg-emerald-700 p-2 rounded-xl border border-emerald-600/40 cursor-pointer transition-all shrink-0"
            title="Editar meu Nome e Cargo/Função"
            id="btn-quick-edit-profile"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* User Switcher Dropdown */}
        {showDropdown && (
          <div 
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-fade-in"
            id="user-switcher-dropdown"
          >
            <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Users className="h-3 w-3 text-emerald-700" />
                Membros da Coordenadoria
              </span>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowProfileModal(true);
                }}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                Editar Perfil
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50">
              {teamUsers.map(user => {
                const isSelected = user.id === currentUser?.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUserId(user.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-emerald-50/70 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/90 font-bold border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 truncate">{user.name}</span>
                        {user.role === 'administrador' && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-mono font-bold">Admin</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{user.roleTitle}</p>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/80 space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setActiveTab('manage', 'users');
                }}
                className="w-full text-center py-1.5 text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-goto-manage-users"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Gerenciar Usuários & Permissões
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full text-center py-1.5 text-[11px] font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-red-200/60"
                id="btn-user-logout"
              >
                <LogOut className="h-3.5 w-3.5 text-red-600" />
                Sair / Bloquear Tela
              </button>
            </div>
          </div>
        )}
      </div>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
