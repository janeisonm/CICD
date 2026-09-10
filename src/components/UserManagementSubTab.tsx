import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { TeamUser } from '../types';
import { 
  Users, UserPlus, ShieldCheck, Edit2, Trash2, Check, X, 
  Briefcase, Mail, Phone, CheckSquare, Sparkles, Key, Lock, Eye, Target, AlertTriangle, Building2
} from 'lucide-react';

export const UserManagementSubTab: React.FC = () => {
  const { 
    state, 
    currentUser, 
    addTeamUser, 
    updateTeamUser, 
    deleteTeamUser, 
    setCurrentUserId,
    updateUserProfile,
    resetUserPassword
  } = useStrategicState();

  const teamUsers = state.teamUsers || [];
  const isAdmin = currentUser?.role === 'administrador';

  // --- MY PROFILE EDIT STATE ---
  const [showMyProfileForm, setShowMyProfileForm] = useState(false);
  const [myNameInput, setMyNameInput] = useState(currentUser?.name || '');
  const [myRoleInput, setMyRoleInput] = useState(currentUser?.roleTitle || '');

  // --- USER CRUD FORM STATE ---
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [roleTitleInput, setRoleTitleInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('Crateus@123');
  const [roleInput, setRoleInput] = useState<'administrador' | 'membro'>('membro');
  const [statusInput, setStatusInput] = useState<'ativo' | 'inativo'>('ativo');
  const [notesInput, setNotesInput] = useState('');

  // --- PASSWORD RESET MODAL STATE ---
  const [resetModalUser, setResetModalUser] = useState<TeamUser | null>(null);
  const [newResetPass, setNewResetPass] = useState('Crateus@123');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  
  // Permissions
  const [allowedTabsInput, setAllowedTabsInput] = useState<('dashboard' | 'timeline' | 'pending' | 'achieved' | 'reports' | 'manage')[]>([
    'dashboard', 'pending', 'manage'
  ]);
  const [allowedSubTabsInput, setAllowedSubTabsInput] = useState<string[]>(['actions', 'visits']);
  const [assignedActionIdsInput, setAssignedActionIdsInput] = useState<string[]>([]);

  const [userToDelete, setUserToDelete] = useState<TeamUser | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const allActions = state.goals.flatMap(g => 
    (g.actions || []).map(a => ({ ...a, goalTitle: g.title }))
  );

  const handleSaveMyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myNameInput.trim() || !myRoleInput.trim()) return;

    updateUserProfile(currentUser.id, myNameInput.trim(), myRoleInput.trim());
    triggerSuccess('Seu Nome e Cargo/Função foram atualizados com sucesso!');
    setShowMyProfileForm(false);
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setNameInput('');
    setRoleTitleInput('');
    setEmailInput('');
    setPhoneInput('');
    setPasswordInput('Crateus@123');
    setRoleInput('membro');
    setStatusInput('ativo');
    setNotesInput('');
    setAllowedTabsInput(['dashboard', 'pending', 'manage']);
    setAllowedSubTabsInput(['actions', 'visits']);
    setAssignedActionIdsInput([]);
  };

  const handleStartEditUser = (user: TeamUser) => {
    setEditingUserId(user.id);
    setNameInput(user.name);
    setRoleTitleInput(user.roleTitle);
    setEmailInput(user.email);
    setPhoneInput(user.phone || '');
    setPasswordInput(user.password || 'Crateus@123');
    setRoleInput(user.role);
    setStatusInput(user.status);
    setNotesInput(user.notes || '');
    setAllowedTabsInput(user.allowedTabs || ['dashboard', 'pending', 'manage']);
    setAllowedSubTabsInput(user.allowedSubTabs || ['actions', 'visits']);
    setAssignedActionIdsInput(user.assignedActionIds || []);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !roleTitleInput.trim() || !emailInput.trim()) return;

    const userData = {
      name: nameInput.trim(),
      roleTitle: roleTitleInput.trim(),
      email: emailInput.trim(),
      phone: phoneInput.trim(),
      password: passwordInput.trim() || 'Crateus@123',
      role: roleInput,
      status: statusInput,
      notes: notesInput.trim(),
      allowedTabs: allowedTabsInput,
      allowedSubTabs: allowedSubTabsInput,
      assignedActionIds: assignedActionIdsInput
    };

    if (editingUserId) {
      updateTeamUser(editingUserId, userData);
      triggerSuccess(`Usuário "${nameInput}" atualizado com sucesso!`);
    } else {
      addTeamUser(userData);
      triggerSuccess(`Novo usuário "${nameInput}" cadastrado na Coordenadoria!`);
    }

    resetUserForm();
  };

  const handleDoResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;

    const resetVal = resetUserPassword(resetModalUser.id, newResetPass.trim() || 'Crateus@123');
    triggerSuccess(`Senha de "${resetModalUser.name}" redefinida para "${resetVal}" com sucesso!`);
    
    // Copy to clipboard
    navigator.clipboard.writeText(resetVal).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }).catch(() => {});

    setTimeout(() => {
      setResetModalUser(null);
    }, 1500);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteTeamUser(userToDelete.id);
    triggerSuccess(`Usuário "${userToDelete.name}" removido com sucesso.`);
    setUserToDelete(null);
    if (editingUserId === userToDelete.id) {
      resetUserForm();
    }
  };

  const toggleTabPermission = (tabKey: 'dashboard' | 'timeline' | 'pending' | 'achieved' | 'reports' | 'manage') => {
    if (allowedTabsInput.includes(tabKey)) {
      if (allowedTabsInput.length === 1) return; // keep at least 1
      setAllowedTabsInput(allowedTabsInput.filter(t => t !== tabKey));
    } else {
      setAllowedTabsInput([...allowedTabsInput, tabKey]);
    }
  };

  const toggleSubTabPermission = (subTabKey: string) => {
    if (allowedSubTabsInput.includes(subTabKey)) {
      setAllowedSubTabsInput(allowedSubTabsInput.filter(s => s !== subTabKey));
    } else {
      setAllowedSubTabsInput([...allowedSubTabsInput, subTabKey]);
    }
  };

  const toggleAssignedAction = (actionId: string) => {
    if (assignedActionIdsInput.includes(actionId)) {
      setAssignedActionIdsInput(assignedActionIdsInput.filter(id => id !== actionId));
    } else {
      setAssignedActionIdsInput([...assignedActionIdsInput, actionId]);
    }
  };

  return (
    <div className="space-y-6" id="user-management-subtab">
      
      {/* Toast alert */}
      {successMsg && (
        <div className="bg-emerald-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md border border-emerald-700 animate-fade-in">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          {successMsg}
        </div>
      )}

      {/* 1. MY PROFILE QUICK EDIT SECTION */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-5 rounded-3xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-green-900 text-white flex items-center justify-center font-black text-xl shadow-md border border-emerald-600/60 shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Seu Perfil Conectado
              </span>
              {currentUser?.role === 'administrador' && (
                <span className="text-[10px] font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-yellow-700" />
                  Administrador Geral
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mt-1">{currentUser?.name}</h3>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
              <Briefcase className="h-3.5 w-3.5 text-emerald-700" />
              {currentUser?.roleTitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMyNameInput(currentUser?.name || '');
            setMyRoleInput(currentUser?.roleTitle || '');
            setShowMyProfileForm(!showMyProfileForm);
          }}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-center"
          id="btn-edit-my-profile-inline"
        >
          <Edit2 className="h-3.5 w-3.5" />
          {showMyProfileForm ? 'Fechar Edição' : 'Editar Meu Nome e Cargo'}
        </button>
      </div>

      {/* MY PROFILE FORM (INLINE COLLAPSIBLE) */}
      {showMyProfileForm && (
        <form onSubmit={handleSaveMyProfile} className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-md space-y-4 animate-fade-in">
          <h4 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Edit2 className="h-4 w-4 text-emerald-700" />
            Atualizar Seu Nome e Cargo/Função
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Seu Nome Completo
              </label>
              <input
                type="text"
                required
                value={myNameInput}
                onChange={(e) => setMyNameInput(e.target.value)}
                placeholder="Ex: Prof. Francisco Reginaldo"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Seu Cargo / Função na Coordenadoria
              </label>
              <input
                type="text"
                required
                value={myRoleInput}
                onChange={(e) => setMyRoleInput(e.target.value)}
                placeholder="Ex: Coordenador de Inovação e Culturas Digitais"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowMyProfileForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      )}

      {/* 2. ADMIN USER CRUD FORM */}
      {isAdmin && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-700" />
                {editingUserId ? 'Editar Usuário da Coordenadoria' : 'Cadastrar Novo Usuário na Coordenadoria'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina o cargo, e-mail e nível de acesso aos módulos e ações do plano de trabalho
              </p>
            </div>
            {editingUserId && (
              <button
                type="button"
                onClick={resetUserForm}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ex: Téc. Roberto Carlos"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  id="input-user-name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cargo / Função
                </label>
                <input
                  type="text"
                  required
                  value={roleTitleInput}
                  onChange={(e) => setRoleTitleInput(e.target.value)}
                  placeholder="Ex: Técnico de Redes e Suporte"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  id="input-user-role-title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail Funcional
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Ex: roberto.suporte@crateus.ce.gov.br"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  id="input-user-email"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Senha Inicial
                </label>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Ex: Crateus@123"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  id="input-user-password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Telefone / Contato
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="(88) 99999-0000"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  id="input-user-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nível de Acesso no Sistema
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  id="select-user-role"
                >
                  <option value="membro">Membro da Equipe (Acesso Controlado)</option>
                  <option value="administrador">Administrador Geral (Acesso Total)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status da Conta
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  id="select-user-status"
                >
                  <option value="ativo">Ativo (Permitir Acesso)</option>
                  <option value="inativo">Inativo (Bloquear Temporariamente)</option>
                </select>
              </div>
            </div>

            {/* PERMISSIONS CONTROL (MODULE TABS) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-700" />
                Módulos Permitidos no Menu Principal (Permissões de Acesso)
              </h4>
              <p className="text-[11px] text-slate-500">
                Selecione quais guias o usuário poderá visualizar e interagir ao navegar pela plataforma
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { key: 'dashboard', label: 'Dashboard' },
                  { key: 'timeline', label: 'Linha do Tempo' },
                  { key: 'pending', label: 'O Que Falta Fazer' },
                  { key: 'achieved', label: 'Alcançados' },
                  { key: 'reports', label: 'Relatórios' },
                  { key: 'manage', label: 'Gestão de Dados' }
                ].map(item => {
                  const isChecked = allowedTabsInput.includes(item.key as any);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => toggleTabPermission(item.key as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                          {isChecked ? '✓' : ''}
                        </span>
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* WORK PLAN ACTIONS LINKED TO THIS USER */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-700" />
                Vincular Ações do Plano de Trabalho ao Usuário
              </h4>
              <p className="text-[11px] text-slate-500">
                Selecione as metas/ações operacionais da coordenadoria que este usuário é responsável por acompanhar ou executar
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                {allActions.length > 0 ? (
                  allActions.map(act => {
                    const isAssigned = assignedActionIdsInput.includes(act.id);
                    return (
                      <label
                        key={act.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isAssigned ? 'bg-emerald-50/70 border-emerald-200 font-bold text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => toggleAssignedAction(act.id)}
                            className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                          />
                          <div className="truncate">
                            <span className="block truncate">{act.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Meta: {act.goalTitle}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-200/70 px-2 py-0.5 rounded-md shrink-0 ml-2">
                          {act.completionPercent}%
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma ação cadastrada no plano de trabalho.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {editingUserId && (
                <button
                  type="button"
                  onClick={resetUserForm}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                id="btn-save-user"
              >
                <Check className="h-4 w-4" />
                {editingUserId ? 'Salvar Alterações do Usuário' : 'Cadastrar Usuário na Coordenadoria'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. TEAM USERS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-700" />
            Quadro de Usuários & Servidores da Coordenadoria ({teamUsers.length})
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            {teamUsers.filter(u => u.status === 'ativo').length} ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamUsers.map(user => {
            const isSelf = user.id === currentUser?.id;
            const assignedActionsCount = (user.assignedActionIds || []).length;

            return (
              <div
                key={user.id}
                className={`p-5 rounded-3xl border transition-all space-y-4 ${
                  isSelf 
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-xs' 
                    : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-emerald-950 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0 border border-slate-700">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900">{user.name}</h4>
                        {user.role === 'administrador' ? (
                          <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                            Administrador
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                            Membro
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[9px] font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Briefcase className="h-3.5 w-3.5 text-emerald-700" />
                        {user.roleTitle}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setResetModalUser(user);
                          setNewResetPass('Crateus@123');
                          setCopiedSuccess(false);
                        }}
                        className="px-2.5 py-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Resetar Senha do Usuário para Padrão"
                      >
                        <Key className="h-3 w-3 text-amber-700" />
                        Resetar Senha
                      </button>
                      <button
                        onClick={() => handleStartEditUser(user)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar Usuário e Permissões"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Module Permissions Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Módulos Liberados pelo Administrador:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(user.allowedTabs || []).map(t => (
                      <span key={t} className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Work Plan Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Ações no Plano de Trabalho: <strong>{assignedActionsCount} atribuídas</strong>
                  </span>
                  {!isSelf && (
                    <button
                      onClick={() => setCurrentUserId(user.id)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Simular Visão deste Usuário
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESET PASSWORD MODAL (ADMIN CONTROL) */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" id="modal-reset-user-password">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md p-6 space-y-4 text-slate-900 relative">
            <button
              onClick={() => setResetModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0 font-bold">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Redefinir Senha de Acesso</h3>
                <p className="text-xs text-slate-500">Usuário: <strong className="text-slate-800">{resetModalUser.name}</strong></p>
              </div>
            </div>

            <form onSubmit={handleDoResetPassword} className="space-y-4">
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-700" />
                  Redefinição por Administrador da Coordenadoria
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Defina a nova senha ou mantenha o padrão institucional <strong className="font-mono bg-white px-1.5 py-0.5 rounded-md border border-amber-300">Crateus@123</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nova Senha para o Usuário
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newResetPass}
                    onChange={(e) => setNewResetPass(e.target.value)}
                    placeholder="Ex: Crateus@123"
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    id="input-reset-password-value"
                  />
                  <button
                    type="button"
                    onClick={() => setNewResetPass('Crateus@123')}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[11px] rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Usar senha padrão institucional"
                  >
                    Usar Padrão
                  </button>
                </div>
              </div>

              {copiedSuccess && (
                <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 animate-fade-in">
                  <Check className="h-4 w-4 text-emerald-700" />
                  Nova senha copiada para a área de transferência!
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  id="btn-confirm-reset-password"
                >
                  <Key className="h-4 w-4" />
                  Confirmar Reset de Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-black">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Confirmar Exclusão de Usuário</h3>
            <p className="text-xs text-slate-600">
              Tem certeza que deseja remover o usuário <strong>{userToDelete.name}</strong> da coordenadoria?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
