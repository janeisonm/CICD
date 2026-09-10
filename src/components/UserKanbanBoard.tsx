import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { WorkPlanAction, WorkPlanGoal, TeamUser } from '../types';
import { 
  Plus, Calendar, Clock, CheckCircle2, AlertTriangle, 
  PlayCircle, Filter, TrendingUp, CheckSquare, Sparkles, 
  UserCheck, ArrowRight, ArrowLeft, ChevronRight, Edit3, 
  Trash2, X, ShieldCheck, Check, Layers, User, MoreVertical,
  BarChart2, ListTodo
} from 'lucide-react';

export const UserKanbanBoard: React.FC = () => {
  const { 
    state, 
    currentUser, 
    addAction, 
    updateAction, 
    updateActionCompletion, 
    deleteAction, 
    addMicroaction, 
    toggleMicroaction, 
    deleteMicroaction 
  } = useStrategicState();

  const isAdmin = currentUser?.role === 'administrador';
  const currentDateStr = '2026-08-04';

  // Filters state
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>(
    isAdmin ? 'all' : currentUser?.id || 'all'
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingActionItem, setEditingActionItem] = useState<{ goalId: string; action: WorkPlanAction } | null>(null);
  const [expandedChecklistActionId, setExpandedChecklistActionId] = useState<string | null>(null);

  // New Action Form State (For Admin & Users)
  const [newTitle, setNewTitle] = useState('');
  const [newGoalId, setNewGoalId] = useState(state.goals[0]?.id || 'g1');
  const [newResponsible, setNewResponsible] = useState(currentUser?.name || '');
  const [newStartDate, setNewStartDate] = useState(currentDateStr);
  const [newDueDate, setNewDueDate] = useState('2026-09-30');
  const [newCategory, setNewCategory] = useState('Tecnologia e Infraestrutura');
  const [newImpactScore, setNewImpactScore] = useState(7);
  const [initialSubtasksText, setInitialSubtasksText] = useState('');

  // Microaction input state for expanded card
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to extract all actions paired with their parent Goal
  const allActionItems: Array<{ goalId: string; goalTitle: string; action: WorkPlanAction }> = [];
  state.goals.forEach(goal => {
    (goal.actions || []).forEach(act => {
      allActionItems.push({
        goalId: goal.id,
        goalTitle: goal.title,
        action: act
      });
    });
  });

  const teamUsers = state.teamUsers || [];

  // Match an action to a TeamUser
  const getAssignedUserForAction = (responsibleStr: string): TeamUser | undefined => {
    if (!responsibleStr) return undefined;
    const lower = responsibleStr.toLowerCase();
    return teamUsers.find(u => 
      u.name.toLowerCase() === lower || 
      lower.includes(u.name.toLowerCase()) || 
      u.email.toLowerCase() === lower
    );
  };

  // Filter actions based on active filters
  const filteredActionItems = allActionItems.filter(item => {
    const act = item.action;

    // User Filter
    if (selectedUserFilter !== 'all') {
      if (selectedUserFilter === 'my_actions') {
        const matchesName = act.responsible?.toLowerCase().includes((currentUser?.name || '').toLowerCase());
        const matchesEmail = act.responsible?.toLowerCase() === currentUser?.email?.toLowerCase();
        if (!matchesName && !matchesEmail) return false;
      } else {
        const targetUser = teamUsers.find(u => u.id === selectedUserFilter);
        if (targetUser) {
          const matchesName = act.responsible?.toLowerCase().includes(targetUser.name.toLowerCase());
          const matchesEmail = act.responsible?.toLowerCase() === targetUser.email.toLowerCase();
          if (!matchesName && !matchesEmail) return false;
        }
      }
    }

    // Category Filter
    if (selectedCategoryFilter !== 'all') {
      if (act.category !== selectedCategoryFilter && item.goalTitle !== selectedCategoryFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchGoal = item.goalTitle.toLowerCase().includes(q);
      const matchResp = act.responsible?.toLowerCase().includes(q);
      if (!matchTitle && !matchGoal && !matchResp) return false;
    }

    return true;
  });

  // Calculate Evolution Percentages per User for Admin / Executive Overview
  const userEvolutionStats = teamUsers.map(user => {
    const userActions = allActionItems.filter(item => {
      const resp = item.action.responsible?.toLowerCase() || '';
      return resp.includes(user.name.toLowerCase()) || resp === user.email.toLowerCase();
    });

    const total = userActions.length;
    const completed = userActions.filter(i => i.action.completionPercent >= 100 || i.action.status === 'concluido').length;
    const inProgress = userActions.filter(i => (i.action.completionPercent > 0 && i.action.completionPercent < 100) && i.action.status !== 'atrasado').length;
    const overdue = userActions.filter(i => i.action.status === 'atrasado' || (i.action.completionPercent < 100 && i.action.dueDate < currentDateStr)).length;
    
    const sumPercent = userActions.reduce((acc, i) => acc + (i.action.completionPercent || 0), 0);
    const avgPercent = total > 0 ? Math.round(sumPercent / total) : 0;

    return {
      user,
      total,
      completed,
      inProgress,
      overdue,
      avgPercent
    };
  });

  // Global Evolution Percentage across all filtered actions
  const totalGlobalActions = allActionItems.length;
  const globalSumPercent = allActionItems.reduce((acc, i) => acc + (i.action.completionPercent || 0), 0);
  const globalAvgEvolution = totalGlobalActions > 0 ? Math.round(globalSumPercent / totalGlobalActions) : 0;

  // Classify actions into Kanban columns
  const getActionKanbanStatus = (act: WorkPlanAction): 'nao_iniciado' | 'em_andamento' | 'atrasado' | 'concluido' => {
    if (act.completionPercent >= 100 || act.status === 'concluido') {
      return 'concluido';
    }
    if (act.status === 'atrasado' || (act.completionPercent < 100 && act.dueDate < currentDateStr)) {
      return 'atrasado';
    }
    if (act.completionPercent > 0 || act.status === 'em_andamento') {
      return 'em_andamento';
    }
    return 'nao_iniciado';
  };

  const columns = {
    nao_iniciado: {
      id: 'nao_iniciado' as const,
      title: 'A Fazer / Não Iniciadas',
      icon: ListTodo,
      color: 'slate',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      headerBg: 'bg-slate-900 text-white',
      items: filteredActionItems.filter(i => getActionKanbanStatus(i.action) === 'nao_iniciado')
    },
    em_andamento: {
      id: 'em_andamento' as const,
      title: 'Em Andamento',
      icon: PlayCircle,
      color: 'blue',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
      headerBg: 'bg-blue-900 text-white',
      items: filteredActionItems.filter(i => getActionKanbanStatus(i.action) === 'em_andamento')
    },
    atrasado: {
      id: 'atrasado' as const,
      title: 'Atrasadas / Em Risco',
      icon: AlertTriangle,
      color: 'red',
      badgeBg: 'bg-red-100 text-red-900 border-red-200',
      headerBg: 'bg-red-950 text-white',
      items: filteredActionItems.filter(i => getActionKanbanStatus(i.action) === 'atrasado')
    },
    concluido: {
      id: 'concluido' as const,
      title: 'Concluídas',
      icon: CheckCircle2,
      color: 'emerald',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      headerBg: 'bg-emerald-900 text-white',
      items: filteredActionItems.filter(i => getActionKanbanStatus(i.action) === 'concluido')
    }
  };

  // Status Shift Handlers
  const handleMoveStatus = (goalId: string, actionId: string, currentPercent: number, newStatus: 'nao_iniciado' | 'em_andamento' | 'atrasado' | 'concluido') => {
    let targetPercent = currentPercent;
    if (newStatus === 'concluido') targetPercent = 100;
    else if (newStatus === 'nao_iniciado') targetPercent = 0;
    else if (newStatus === 'em_andamento' && currentPercent === 0) targetPercent = 25;
    
    updateActionCompletion(goalId, actionId, targetPercent);
    updateAction(goalId, actionId, { status: newStatus });
    showToast(`Status da ação atualizado para "${newStatus.replace('_', ' ').toUpperCase()}" (${targetPercent}%).`);
  };

  // Open modal to add action
  const handleOpenAddModal = (presetUser?: string) => {
    setNewTitle('');
    setNewGoalId(state.goals[0]?.id || 'g1');
    setNewResponsible(presetUser || currentUser?.name || teamUsers[0]?.name || '');
    setNewStartDate(currentDateStr);
    setNewDueDate('2026-09-30');
    setNewCategory('Tecnologia e Infraestrutura');
    setNewImpactScore(7);
    setInitialSubtasksText('');
    setIsAddModalOpen(true);
  };

  // Create action logic
  const handleCreateActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const microactionsList = initialSubtasksText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((title, idx) => ({
        id: `m_init_${Date.now()}_${idx}`,
        title,
        completed: false
      }));

    const actionData: Omit<WorkPlanAction, 'id'> = {
      goalId: newGoalId,
      title: newTitle.trim(),
      completionPercent: 0,
      startDate: newStartDate || currentDateStr,
      dueDate: newDueDate || '2026-09-30',
      status: 'nao_iniciado',
      category: newCategory,
      microactionsCount: microactionsList.length || 3,
      microactionsCompleted: 0,
      microactionsList: microactionsList.length > 0 ? microactionsList : undefined,
      responsible: newResponsible.trim() || currentUser?.name || 'Equipe CICD',
      impactScore: Number(newImpactScore) || 7
    };

    addAction(newGoalId, actionData);
    setIsAddModalOpen(false);
    showToast(`Ação "${newTitle.trim()}" criada com sucesso e atribuída a ${newResponsible}!`);
  };

  // Add microaction step inside expanded card
  const handleAddSubtaskInline = (goalId: string, actionId: string) => {
    if (!newSubtaskTitle.trim()) return;
    addMicroaction(goalId, actionId, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    showToast('Etapa operacional adicionada!');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="user-kanban-board-module">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-full flex items-center gap-2.5 shadow-2xl border border-emerald-500/50 animate-fade-in">
          <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER FOR KANBAN */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-green-950 p-6 rounded-3xl border border-emerald-800/60 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-900/80 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-500/40">
              <Layers className="h-3.5 w-3.5" /> Quadro Kanban Operacional
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              Gestão de Ações por Usuário
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
              Cada membro gerencia o andamento de suas próprias ações. Para o administrador, o painel exibe a evolução percentual e permite criar e atribuir novas ações com prazos definidos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Action creator button */}
            <button
              onClick={() => handleOpenAddModal()}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-emerald-300"
              id="btn-admin-add-kanban-action"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Nova Ação com Data (Atribuir)
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE EVOLUTION METRICS OVERVIEW (FOR ADMINS & TEAM LEADERSHIP) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="section-admin-evolution-summary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Painel de Evolução Percentual dos Usuários
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Acompanhamento de progresso geral e percentual de entregas por membro da equipe
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-emerald-700" />
              <span>Evolução Geral: <strong className="text-emerald-700 font-extrabold text-sm">{globalAvgEvolution}%</strong></span>
            </div>
          </div>
        </div>

        {/* TEAM USERS EVOLUTION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {userEvolutionStats.map(stat => {
            const isMe = stat.user.id === currentUser?.id;
            return (
              <div 
                key={stat.user.id} 
                onClick={() => setSelectedUserFilter(stat.user.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedUserFilter === stat.user.id
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                    : 'bg-slate-50/50 border-slate-200/80 hover:border-emerald-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-800 text-white border-2 border-emerald-400 flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                      {stat.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1">
                        {stat.user.name}
                        {isMe && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase">Você</span>}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-medium">{stat.user.roleTitle}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(stat.user.name);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      title={`Atribuir nova ação para ${stat.user.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Progress bar and counts */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-600">Evolução de Entregas</span>
                    <span className="text-emerald-700 font-extrabold">{stat.avgPercent}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300/60">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${stat.avgPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1">
                    <span>{stat.completed}/{stat.total} Concluídas</span>
                    {stat.overdue > 0 && (
                      <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        {stat.overdue} Atrasadas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
            Filtrar Kanban:
          </div>

          {/* User selector filter */}
          <select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 font-extrabold text-slate-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            id="select-kanban-user-filter"
          >
            <option value="all">👥 Todos os Usuários da Equipe ({allActionItems.length} Ações)</option>
            {currentUser && (
              <option value="my_actions">👤 Minhas Ações ({allActionItems.filter(i => i.action.responsible?.toLowerCase().includes(currentUser.name.toLowerCase())).length})</option>
            )}
            {teamUsers.map(u => (
              <option key={u.id} value={u.id}>
                👤 {u.name} ({allActionItems.filter(i => i.action.responsible?.toLowerCase().includes(u.name.toLowerCase())).length})
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 font-bold text-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            id="select-kanban-category-filter"
          >
            <option value="all">🏷️ Todas as Categorias</option>
            <option value="Tecnologia e Infraestrutura">Infraestrutura e Conectividade</option>
            <option value="Formação Continuada">Formação Continuada</option>
            <option value="Gestão e Monitoramento">Gestão e Monitoramento</option>
            <option value="Agendas Pedagógicas">Agendas Pedagógicas</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Buscar por título ou responsável..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
            id="input-kanban-search"
          />
          <Filter className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* KANBAN BOARD 4-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start" id="kanban-grid-container">
        
        {Object.values(columns).map(col => {
          const Icon = col.icon;
          return (
            <div 
              key={col.id} 
              className="bg-slate-100/70 border border-slate-200/80 rounded-3xl p-4 min-h-[520px] flex flex-col space-y-4 shadow-inner"
              id={`kanban-col-${col.id}`}
            >
              {/* Column Header */}
              <div className={`p-3.5 rounded-2xl ${col.headerBg} shadow-md flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-300" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-white">
                    {col.title}
                  </h4>
                </div>
                <span className="bg-white/20 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </div>

              {/* Column Content Items */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
                {col.items.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                    Nenhuma ação nesta coluna.
                  </div>
                ) : (
                  col.items.map(item => {
                    const act = item.action;
                    const assignedUser = getAssignedUserForAction(act.responsible);
                    const isExpanded = expandedChecklistActionId === act.id;
                    const isOverdue = act.status === 'atrasado' || (act.completionPercent < 100 && act.dueDate < currentDateStr);
                    const microList = act.microactionsList || [];

                    return (
                      <div 
                        key={act.id} 
                        className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative group ${
                          isOverdue ? 'border-red-300 bg-red-50/20' : 'border-slate-200/90'
                        }`}
                        id={`kanban-card-${act.id}`}
                      >
                        {/* Card Header: Category & Admin Menu */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 truncate max-w-[180px]">
                            {act.category || item.goalTitle}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Delete button (Admin or Owner) */}
                            {isAdmin && (
                              <button
                                onClick={() => deleteAction(item.goalId, act.id)}
                                className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                title="Excluir Ação"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                          {act.title}
                        </h5>

                        {/* Assigned Responsible User */}
                        <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-emerald-800 text-white border border-emerald-400 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                              {act.responsible?.charAt(0) || 'U'}
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 truncate">
                              {act.responsible}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 shrink-0">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className={isOverdue ? 'text-red-600 font-extrabold' : 'text-slate-600'}>
                              {act.dueDate}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar & Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-500">Progresso</span>
                            <span className="text-emerald-700 font-extrabold">{act.completionPercent}%</span>
                          </div>
                          
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                act.completionPercent >= 100 
                                  ? 'bg-emerald-600' 
                                  : isOverdue 
                                    ? 'bg-red-500' 
                                    : 'bg-blue-600'
                              }`}
                              style={{ width: `${act.completionPercent}%` }}
                            ></div>
                          </div>

                          {/* USER ACTION CONTROLS: Quick Progress Slider / Step Buttons */}
                          <div className="flex items-center justify-between gap-1 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const next = Math.max(0, act.completionPercent - 25);
                                updateActionCompletion(item.goalId, act.id, next);
                              }}
                              className="px-2 py-0.5 text-[10px] font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              title="-25%"
                            >
                              -25%
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = Math.min(100, act.completionPercent + 25);
                                updateActionCompletion(item.goalId, act.id, next);
                              }}
                              className="px-2 py-0.5 text-[10px] font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              title="+25%"
                            >
                              +25%
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActionCompletion(item.goalId, act.id, 100)}
                              className="px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors cursor-pointer"
                              title="Marcar 100% Concluída"
                            >
                              100%
                            </button>
                          </div>
                        </div>

                        {/* Subtasks / Microactions Accordion Toggle */}
                        <div className="border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={() => setExpandedChecklistActionId(isExpanded ? null : act.id)}
                            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                              Etapas ({microList.filter(m => m.completed).length}/{microList.length})
                            </span>
                            <span className="text-[10px] text-emerald-700 underline font-extrabold">
                              {isExpanded ? 'Ocultar' : 'Gerenciar'}
                            </span>
                          </button>

                          {/* Subtasks Expanded Drawer */}
                          {isExpanded && (
                            <div className="mt-2.5 space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs animate-fade-in">
                              <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                                Check-list de Execução do Usuário:
                              </p>

                              {microList.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic">Nenhuma etapa cadastrada.</p>
                              ) : (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {microList.map(m => (
                                    <div key={m.id} className="flex items-start gap-2 text-[11px]">
                                      <input
                                        type="checkbox"
                                        checked={m.completed}
                                        onChange={() => toggleMicroaction(item.goalId, act.id, m.id)}
                                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                      />
                                      <span className={`flex-1 font-medium leading-tight ${m.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                        {m.title}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => deleteMicroaction(item.goalId, act.id, m.id)}
                                        className="text-slate-300 hover:text-red-500 text-[10px]"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add subtask input */}
                              <div className="flex gap-1.5 pt-1.5 border-t border-slate-200">
                                <input
                                  type="text"
                                  placeholder="Nova etapa operacional..."
                                  value={newSubtaskTitle}
                                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                  className="flex-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddSubtaskInline(item.goalId, act.id)}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer shrink-0"
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* COLUMN MOVE BUTTONS (Shift Card) */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-bold">
                          {col.id !== 'nao_iniciado' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const prevCol = col.id === 'concluido' ? 'em_andamento' : 'nao_iniciado';
                                handleMoveStatus(item.goalId, act.id, act.completionPercent, prevCol);
                              }}
                              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <ArrowLeft className="h-3 w-3" /> Voltar
                            </button>
                          ) : <div />}

                          {col.id !== 'concluido' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const nextCol = col.id === 'nao_iniciado' ? 'em_andamento' : 'concluido';
                                handleMoveStatus(item.goalId, act.id, act.completionPercent, nextCol);
                              }}
                              className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-extrabold"
                            >
                              Avançar <ArrowRight className="h-3 w-3" />
                            </button>
                          ) : <div />}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

      </div>

      {/* CREATE ACTION MODAL (WITH TARGET DATES AND ASSIGNED USER) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" id="modal-create-kanban-action">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 space-y-4 text-slate-900 relative">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 font-bold">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Atribuir Nova Ação com Data</h3>
                <p className="text-xs text-slate-500">Cadastre uma ação operacional com prazo de entrega definido</p>
              </div>
            </div>

            <form onSubmit={handleCreateActionSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título da Ação Operacional *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Instalação de Roteador Wi-Fi na EEIEF Maria de Lourdes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  id="input-new-action-title"
                />
              </div>

              {/* Goal & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Meta de Destino
                  </label>
                  <select
                    value={newGoalId}
                    onChange={(e) => setNewGoalId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    id="select-new-action-goal"
                  >
                    {state.goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria Operacional
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    id="select-new-action-category"
                  >
                    <option value="Tecnologia e Infraestrutura">Infraestrutura e Conectividade</option>
                    <option value="Formação Continuada">Formação Continuada</option>
                    <option value="Gestão e Monitoramento">Gestão e Monitoramento</option>
                    <option value="Agendas Pedagógicas">Agendas Pedagógicas</option>
                  </select>
                </div>
              </div>

              {/* Assigned Responsible User */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Usuário Responsável Atribuído *
                </label>
                <select
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  id="select-new-action-responsible"
                >
                  {teamUsers.map(u => (
                    <option key={u.id} value={u.name}>
                      👤 {u.name} — {u.roleTitle} ({u.role === 'administrador' ? 'Admin' : 'Membro'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> Data de Início
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-800"
                    id="input-new-action-startdate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Prazo Final / Data Limite *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                    id="input-new-action-duedate"
                  />
                </div>
              </div>

              {/* Initial Microactions (Checklist steps) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Etapas Iniciais do Check-list (Uma por linha - Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Etapa 1: Vistoria local e levantamento&#10;Etapa 2: Aquisição e configuração do equipamento&#10;Etapa 3: Instalação e homologação final"
                  value={initialSubtasksText}
                  onChange={(e) => setInitialSubtasksText(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-800"
                  id="textarea-new-action-subtasks"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  id="btn-submit-create-action"
                >
                  <Check className="h-4 w-4" />
                  Salvar e Atribuir Ação
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
