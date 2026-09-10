import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { School, Project, WorkPlanGoal, WorkPlanAction } from '../types';
import { UserKanbanBoard } from './UserKanbanBoard';
import { 
  AlertCircle, Calendar, CheckSquare, 
  Clock, Flame, Info, 
  MapPin, Play, Sparkles, Zap, Layers, ListFilter
} from 'lucide-react';

export const WhatIsLeftTab: React.FC = () => {
  const { state, updateActionCompletion, addTechnicalVisit } = useStrategicState();
  const [activeSubView, setActiveSubView] = useState<'kanban' | 'critical_agenda'>('kanban');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentDateStr = '2026-07-10';
  const currentDate = new Date(currentDateStr);

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // 1. Atividades vencidas (overdue actions)
  const overdueActions: (WorkPlanAction & { goalId: string; goalTitle: string })[] = [];
  state.goals.forEach(goal => {
    goal.actions.forEach(act => {
      if (act.completionPercent < 100 && (act.status === 'atrasado' || getDaysDiff(act.dueDate) < 0)) {
        overdueActions.push({ ...act, goalId: goal.id, goalTitle: goal.title });
      }
    });
  });

  // 2. Atividades do mês (due in July 2026)
  const thisMonthActions: (WorkPlanAction & { goalId: string; goalTitle: string })[] = [];
  state.goals.forEach(goal => {
    goal.actions.forEach(act => {
      if (act.completionPercent < 100 && act.dueDate.startsWith('2026-07')) {
        thisMonthActions.push({ ...act, goalId: goal.id, goalTitle: goal.title });
      }
    });
  });

  // 3. Atividades do próximo mês (due in August 2026)
  const nextMonthActions: (WorkPlanAction & { goalId: string; goalTitle: string })[] = [];
  state.goals.forEach(goal => {
    goal.actions.forEach(act => {
      if (act.completionPercent < 100 && act.dueDate.startsWith('2026-08')) {
        nextMonthActions.push({ ...act, goalId: goal.id, goalTitle: goal.title });
      }
    });
  });

  // 4. Metas ainda não iniciadas (WorkPlanGoal where status is nao_iniciado or all actions are at 0%)
  const unstartedGoals: WorkPlanGoal[] = state.goals.filter(goal => {
    const allUnstarted = goal.actions.every(act => act.completionPercent === 0);
    return goal.status === 'nao_iniciado' || allUnstarted;
  });

  // 5. Ações com baixo percentual de execução (completionPercent < 35% and active)
  const lowExecutionActions: (WorkPlanAction & { goalId: string; goalTitle: string })[] = [];
  state.goals.forEach(goal => {
    goal.actions.forEach(act => {
      if (act.completionPercent > 0 && act.completionPercent < 35) {
        lowExecutionActions.push({ ...act, goalId: goal.id, goalTitle: goal.title });
      }
    });
  });

  // 6. Escolas que ainda não receberam atendimento (visitsCount === 0 or status === 'pendente')
  const unservedSchools: School[] = state.schools.filter(s => s.visitsCount === 0 || s.status === 'pendente');

  // 7. Projetos pendentes (projects with status === 'pendente' or completionPercent === 0)
  const pendingProjects: Project[] = state.projects.filter(p => p.status === 'pendente' || p.completionPercent === 0);

  // --- INTERACTIVE QUICK HANDLERS ---
  const handleQuickComplete = (goalId: string, actionId: string, title: string) => {
    updateActionCompletion(goalId, actionId, 100);
    notifySuccess(`Sucesso! Ação "${title}" marcada como concluída e integrada ao Dashboard.`);
  };

  const handleUpdateProgress = (goalId: string, actionId: string, title: string, current: number) => {
    const nextProgress = Math.min(current + 25, 100);
    updateActionCompletion(goalId, actionId, nextProgress);
    notifySuccess(`Progresso de "${title}" atualizado para ${nextProgress}%.`);
  };

  const handleQuickServeSchool = (schoolId: string, schoolName: string) => {
    addTechnicalVisit({
      schoolId,
      schoolName,
      date: '2026-07-10',
      responsible: 'Téc. Reginaldo Santos (Visita Expressa)',
      details: 'Atendimento prioritário realizado via atalho de agenda inteligente para sanar pendências imediatas.',
      internetSpeed: 45,
      mainNeeds: ['Nenhuma pendência urgente restando após atendimento express'],
      status: 'realizada',
      photos: []
    });
    notifySuccess(`Sucesso! Visita técnica homologada para a escola "${schoolName}". Status atualizado.`);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="what-is-left-tab">
      
      {/* Dynamic alert message */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-full flex items-center gap-2.5 shadow-xl border border-slate-800 animate-fade-in">
          <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300 shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Header card with counts */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-blue-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-white/5">
            <Sparkles className="h-3 w-3" /> Agenda Inteligente
          </div>
          <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight uppercase">O Que Falta Fazer?</h2>
          <p className="text-xs text-indigo-100 mt-1.5 max-w-xl font-medium leading-relaxed">
            O sistema mapeia automaticamente todas as pendências e gargalos do plano de Crateús. Use os botões rápidos para atualizar as metas direto da agenda operacional!
          </p>

          {/* Mini matrix statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-white/10">
            <div>
              <div className="text-2xl font-mono font-extrabold text-red-400">{overdueActions.length}</div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Ações Vencidas</p>
            </div>
            <div>
              <div className="text-2xl font-mono font-extrabold text-yellow-400">{thisMonthActions.length}</div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Pendentes Julho</p>
            </div>
            <div>
              <div className="text-2xl font-mono font-extrabold text-orange-400">{unservedSchools.length}</div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Escolas Sem Visita</p>
            </div>
            <div>
              <div className="text-2xl font-mono font-extrabold text-blue-400">{pendingProjects.length}</div>
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Projetos Pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW SUB-TAB NAVIGATION BUTTONS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveSubView('kanban')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
            activeSubView === 'kanban'
              ? 'bg-emerald-800 text-white shadow-md border border-emerald-600'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
          }`}
          id="btn-subview-kanban"
        >
          <Layers className="h-4 w-4 text-emerald-300" />
          Quadro Kanban de Ações dos Usuários
        </button>

        <button
          onClick={() => setActiveSubView('critical_agenda')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
            activeSubView === 'critical_agenda'
              ? 'bg-slate-900 text-white shadow-md border border-slate-700'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
          }`}
          id="btn-subview-critical-agenda"
        >
          <ListFilter className="h-4 w-4 text-blue-400" />
          Visão de Atividades Vencidas e Gargalos
        </button>
      </div>

      {/* CONDITIONAL SUBVIEW CONTENT */}
      {activeSubView === 'kanban' ? (
        <UserKanbanBoard />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTION & CALENDAR AGENDA (8 units) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Vencidas Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="box-overdue-actions">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 uppercase tracking-tight">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Atividades Críticas e Vencidas
              </h3>
              <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Atraso Total
              </span>
            </div>

            {overdueActions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhuma ação atrasada! Bom trabalho com o cronograma.
              </div>
            ) : (
              <div className="space-y-4">
                {overdueActions.map(act => {
                  const days = Math.abs(getDaysDiff(act.dueDate));
                  return (
                    <div key={act.id} className="p-4 bg-red-50/10 rounded-2xl border border-red-100/50 hover:border-red-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] bg-red-100 text-red-850 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Atrasado {days}d
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-mono font-medium rounded-full px-2 py-0.5 border border-slate-150">
                            Venceu em {act.dueDate}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-2">{act.title}</h4>
                        <p className="text-xs text-slate-500 truncate mt-1 font-medium">Meta: {act.goalTitle}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleUpdateProgress(act.goalId, act.id, act.title, act.completionPercent)}
                          className="flex-1 sm:flex-none bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-[10px] font-bold px-3 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider shadow-xs"
                          title="Aumentar progresso em 25%"
                        >
                          +25% Progresso
                        </button>
                        <button
                          onClick={() => handleQuickComplete(act.goalId, act.id, act.title)}
                          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 uppercase tracking-wider shadow-xs"
                        >
                          <CheckSquare className="h-3 w-3" /> Concluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desta Semana & Do Mês */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="box-monthly-actions">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 uppercase tracking-tight">
                <Calendar className="h-4 w-4 text-blue-600" />
                Pendentes de Julho / Próximas Entregas
              </h3>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Fluxo Mensal
              </span>
            </div>

            {thisMonthActions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhuma outra entrega programada para este mês corrente.
              </div>
            ) : (
              <div className="space-y-4">
                {thisMonthActions.map(act => {
                  const days = getDaysDiff(act.dueDate);
                  return (
                    <div key={act.id} className="p-4 bg-slate-50/30 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {days === 0 ? 'Prazo Hoje' : `Vence em ${days}d`}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">Resp: {act.responsible}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-2">{act.title}</h4>
                        <p className="text-xs text-slate-500 truncate mt-1 font-medium">Progresso Atual: {act.completionPercent}% | Meta: {act.goalTitle}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleUpdateProgress(act.goalId, act.id, act.title, act.completionPercent)}
                          className="flex-1 sm:flex-none bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[10px] font-bold px-3 py-2 rounded-full transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                        >
                          Progresso +25%
                        </button>
                        <button
                          onClick={() => handleQuickComplete(act.goalId, act.id, act.title)}
                          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-2 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider shadow-xs"
                        >
                          <CheckSquare className="h-3 w-3" /> Concluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Baixo percentual de execução */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="box-low-progress-actions">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 uppercase tracking-tight">
                <Flame className="h-4 w-4 text-orange-500" />
                Ações com Baixo Percentual de Execução
              </h3>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Progresso &lt; 35%
              </span>
            </div>

            {lowExecutionActions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Excelente! Todas as ações iniciadas estão com bom andamento (&gt;= 35%).
              </div>
            ) : (
              <div className="space-y-4">
                {lowExecutionActions.map(act => (
                  <div key={act.id} className="p-4 bg-amber-50/10 rounded-2xl border border-amber-100 hover:border-amber-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Progresso Crítico: {act.completionPercent}%
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono font-medium">Entrega em {act.dueDate}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-2">{act.title}</h4>
                      <p className="text-xs text-slate-500 truncate mt-1 font-medium">Resp: {act.responsible} | Meta: {act.goalTitle}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateProgress(act.goalId, act.id, act.title, act.completionPercent)}
                        className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-2 rounded-full transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                      >
                        Aumentar +25%
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximo mês (August) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="box-next-month-actions">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 uppercase tracking-tight">
              <Clock className="h-4 w-4 text-sky-600" />
              Previsão para o Próximo Mês (Agosto)
            </h3>
            {nextMonthActions.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">Nenhuma entrega mapeada especificamente para Agosto ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nextMonthActions.map(act => (
                  <div key={act.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/80 hover:border-slate-200 transition-all">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                      <span>Vence em {act.dueDate}</span>
                      <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full uppercase">Futuro</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 mt-2 line-clamp-2 leading-relaxed">{act.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Responsável: {act.responsible}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: STRUCTURAL PENDENCIES (4 units) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Escolas que ainda não receberam atendimento */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="box-unserved-schools">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 uppercase tracking-tight">
              <MapPin className="h-4 w-4 text-orange-500" />
              Escolas Pendentes de Visita
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium">
              Estas escolas do município de Crateús ainda não registraram vistorias de conectividade e infraestrutura tecnológica este ano:
            </p>

            {unservedSchools.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center text-xs text-emerald-700 font-bold flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider">
                <CheckSquare className="h-4 w-4" /> 100% das escolas atendidas!
              </div>
            ) : (
              <div className="space-y-3">
                {unservedSchools.map(school => (
                  <div key={school.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 transition-all flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{school.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">Bairro: {school.neighborhood} | Infra: <span className="font-semibold text-slate-700">{school.infrastructureLevel}</span></p>
                    </div>
                    
                    <button
                      onClick={() => handleQuickServeSchool(school.id, school.name)}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider shadow-xs"
                    >
                      <Zap className="h-3 w-3" /> Registrar Atendimento Rápido
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metas ainda não iniciadas */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="box-unstarted-goals">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 uppercase tracking-tight">
              <Play className="h-4 w-4 text-indigo-500" />
              Metas Não Iniciadas
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium">
              Estas grandes metas estratégicas requerem planejamento para a abertura de suas ações operacionais:
            </p>

            {unstartedGoals.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">Todas as metas estratégicas foram iniciadas!</p>
            ) : (
              <div className="space-y-3">
                {unstartedGoals.map(goal => (
                  <div key={goal.id} className="p-4 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl">
                    <h4 className="font-bold text-xs text-slate-900">{goal.title}</h4>
                    <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed font-medium">{goal.description}</p>
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-indigo-100/40 text-[9px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
                      <span>Cat: {goal.category}</span>
                      <span>Prazo: {goal.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projetos pendentes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="box-pending-projects">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 uppercase tracking-tight">
              <Info className="h-4 w-4 text-blue-500" />
              Projetos Pendentes
            </h3>

            {pendingProjects.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">Nenhum projeto pendente de inicialização.</p>
            ) : (
              <div className="space-y-3">
                {pendingProjects.map(p => (
                  <div key={p.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-xs text-slate-800">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-medium">{p.description}</p>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-3 font-semibold uppercase tracking-wider border-t border-slate-100 pt-2">
                      <span>Resp: {p.responsible}</span>
                      <span className="text-blue-600 font-bold">R$ {p.budget.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
      )}

    </div>
  );
};
