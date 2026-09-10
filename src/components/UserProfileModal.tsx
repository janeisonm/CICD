import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { UserCheck, X, Check, Briefcase, User as UserIcon, Mail, Phone, ShieldCheck, Key, Lock, AlertCircle } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, changeUserPassword } = useStrategicState();

  const [activeSubSection, setActiveSubSection] = useState<'profile' | 'password'>('profile');

  // Profile data state
  const [name, setName] = useState(currentUser?.name || '');
  const [roleTitle, setRoleTitle] = useState(currentUser?.roleTitle || '');

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roleTitle.trim()) return;

    updateUserProfile(currentUser.id, name.trim(), roleTitle.trim());
    setStatusMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    setTimeout(() => {
      setStatusMsg(null);
      onClose();
    }, 1200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPass !== confirmPass) {
      setStatusMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    const res = changeUserPassword(currentUser.id, currentPass, newPass);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" id="user-profile-modal-backdrop">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-900 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          id="btn-close-profile-modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-emerald-600 shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 truncate">
              {currentUser?.name}
            </h3>
            <p className="text-xs text-slate-500 truncate">{currentUser?.roleTitle}</p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex rounded-xl bg-slate-100 p-1 gap-1 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setActiveSubSection('profile'); setStatusMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubSection === 'profile' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="h-3.5 w-3.5" />
            Dados Pessoais
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubSection('password'); setStatusMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubSection === 'password' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            Alterar Senha
          </button>
        </div>

        {/* STATUS MESSAGE */}
        {statusMsg && (
          <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-fade-in ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <Check className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {activeSubSection === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-emerald-700" />
                Seu Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Prof. Francisco Reginaldo"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                id="input-user-profile-name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-emerald-700" />
                Seu Cargo / Função na Coordenadoria
              </label>
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Ex: Coordenador de Inovação e Culturas Digitais"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                id="input-user-profile-role"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="flex items-center gap-1 text-slate-500">
                  <Mail className="h-3 w-3 text-slate-400" /> E-mail Funcional:
                </span>
                <span className="font-mono text-slate-700 font-semibold">{currentUser?.email}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="flex items-center gap-1 text-slate-500">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> Nível de Perfil:
                </span>
                <span className="font-semibold text-slate-800">{currentUser?.role === 'administrador' ? 'Administrador Geral' : 'Membro da Equipe'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                id="btn-cancel-profile-edit"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                id="btn-save-profile-edit"
              >
                <Check className="h-4 w-4" />
                Salvar Meu Perfil
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-700" />
                Senha Atual
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Informe sua senha atual"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 font-mono"
                id="input-current-password"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-emerald-700" />
                Nova Senha
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 font-mono"
                id="input-new-password"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-700" />
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 font-mono"
                id="input-confirm-password"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                id="btn-save-new-password"
              >
                <Key className="h-4 w-4" />
                Atualizar Senha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
