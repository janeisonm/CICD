import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { WorkPlanAction, TechnicalVisit, Project } from '../types';
import { AlertCircle, Calendar, CheckCircle2, Flame, Inbox, Sparkles, TrendingUp } from 'lucide-react';

export const SystemIntelligence: React.FC = () => {
  const { state } = useStrategicState();
  const [activePanel, setActivePanel] = useState<'today' | 'overdue' | 'next' | 'risk' | 'priority'>('today');

  const currentDateStr = '2026-07-10';
  const currentDate = new Date(currentDateStr);

  // Helper: date differences in days
  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Extract all actions
  const allActions: (WorkPlanAction & { goalTitle: string })[] = [];
  state.goals.forEach(goal => {
    goal.actions.forEach(act => {
      allActions.push({ ...act, goalTitle: goal.title });
    });
  });

  // 1. O que devo fazer hoje (due today or technical visit scheduled for today or active week tasks)
  const todayActivities: { type: 'action' | 'visit' | 'project'; title: string; subtitle: string; tag: string }[] = [];
  
  // Check technical visits around today
  state.visits.forEach(v => {
    if (v.date === currentDateStr) {
      todayActivities.push({
        type: 'visit',
        title: `Visita Técnica: ${v.schoolName}`,
        subtitle: `Responsável: ${v.responsible}. Status: ${v.status === 'realizada' ? 'Concluída' : 'Pendente'}`,
        tag: 'Urgente'
      });
    } else if (v.status === 'pendente' && getDaysDiff(v.date) >= -3 && getDaysDiff(v.date) <= 3) {
      todayActivities.push({
        type: 'visit',
        title: `Visita Agendada: ${v.schoolName}`,
        subtitle: `Data: ${v.date} | Responsável: ${v.responsible}`,
        tag: getDaysDiff(v.date) < 0 ? 'Atrasada' : 'Esta Semana'
      });
    }
  });

  // Check actions due today or current work
  allActions.forEach(act => {
    const diff = getDaysDiff(act.dueDate);
    if (diff === 0 && act.completionPercent < 100) {
      todayActivities.push({
        type: 'action',
        title: act.title,
        subtitle: `Meta: ${act.goalTitle}`,
        tag: 'Prazo Final Hoje'
      });
    } else if (act.status === 'em_andamento' && act.completionPercent > 0 && act.completionPercent < 100 && Math.abs(diff) <= 3) {
      todayActivities.push({
        type: 'action',
        title: `Executar: ${act.title}`,
        subtitle: `Progresso atual: ${act.completionPercent}% | Responsável: ${act.responsible}`,
        tag: 'Ação em Foco'
      });
    }
  });

  if (todayActivities.length === 0) {
    todayActivities.push({
      type: 'action',
      title: 'Verificação periódica dos laboratórios de Crateús',
      subtitle: 'Monitorar o andamento do sinal Wi-Fi nas escolas já atendidas.',
      tag: 'Rotina'
    });
    todayActivities.push({
      type: 'visit',
      title: 'Planejamento das visitas técnicas da próxima semana',
      subtitle: 'Preparar o roteiro e os materiais de teste de velocidade de internet.',
      tag: 'Planejamento'
    });
  }

  // 2. O que está atrasado (overdue actions, visits, pending projects past due)
  const overdueActivities: { type: string; title: string; extra: string; days: number }[] = [];
  allActions.forEach(act => {
    const diff = getDaysDiff(act.dueDate);
    if (act.completionPercent < 100 && (act.status === 'atrasado' || diff < 0)) {
      overdueActivities.push({
        type: 'Ação do Plano',
        title: act.title,
        extra: `Meta: ${act.goalTitle} | Responsável: ${act.responsible}`,
        days: Math.abs(diff)
      });
    }
  });
  state.visits.forEach(v => {
    const diff = getDaysDiff(v.date);
    if (v.status === 'pendente' && diff < 0) {
      overdueActivities.push({
        type: 'Visita Técnica',
        title: `Visita não realizada: ${v.schoolName}`,
        extra: `Responsável original: ${v.responsible} | Agendada para: ${v.date}`,
        days: Math.abs(diff)
      });
    }
  });
  // Sort by highest delay
  overdueActivities.sort((a, b) => b.days - a.days);

  // 3. Próximas entregas (next 30 days)
  const nextDeliveries: { title: string; category: string; date: string; daysLeft: number; responsible: string }[] = [];
  allActions.forEach(act => {
    const diff = getDaysDiff(act.dueDate);
    if (act.completionPercent < 100 && diff > 0 && diff <= 30) {
      nextDeliveries.push({
        title: act.title,
        category: 'Ação do Plano',
        date: act.dueDate,
        daysLeft: diff,
        responsible: act.responsible
      });
    }
  });
  state.projects.forEach(p => {
    const diff = getDaysDiff(p.dueDate);
    if (p.status !== 'finalizado' && diff > 0 && diff <= 45) {
      nextDeliveries.push({
        title: `Encerramento de Projeto: ${p.name}`,
        category: 'Projeto',
        date: p.dueDate,
        daysLeft: diff,
        responsible: p.responsible
      });
    }
  });
  nextDeliveries.sort((a, b) => a.daysLeft - b.daysLeft);

  // 4. Metas em risco (completion low relative to deadline, or with overdue actions)
  const riskyMetas: { title: string; reason: string; level: 'Crítico' | 'Moderado'; percent: number }[] = [];
  state.goals.forEach(goal => {
    const uncompletedActions = goal.actions.filter(a => a.completionPercent < 100);
    const overdueCount = uncompletedActions.filter(a => a.status === 'atrasado' || getDaysDiff(a.dueDate) < 0).length;
    
    // Average completion percent
    const avgPercent = goal.actions.length > 0 
      ? goal.actions.reduce((acc, a) => acc + a.completionPercent, 0) / goal.actions.length
      : 0;

    const daysLeft = getDaysDiff(goal.dueDate);

    if (overdueCount > 0 && avgPercent < 100) {
      riskyMetas.push({
        title: goal.title,
        reason: `Possui ${overdueCount} ação(ões) atrasada(s).`,
        level: 'Crítico',
        percent: Math.round(avgPercent)
      });
    } else if (daysLeft > 0 && daysLeft < 60 && avgPercent < 40) {
      riskyMetas.push({
        title: goal.title,
        reason: `Baixo progresso (${Math.round(avgPercent)}%) com vencimento em ${daysLeft} dias.`,
        level: 'Moderado',
        percent: Math.round(avgPercent)
      });
    }
  });

  // 5. Sugestões de prioridade (Muito Alta, Alta, Média, Baixa)
  const prioritizedTasks: { title: string; priority: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa'; reason: string; responsible: string }[] = [];
  
  allActions.forEach(act => {
    const diff = getDaysDiff(act.dueDate);
    let priority: 'Muito Alta' | 'Alta' | 'Média' | 'Baixa' = 'Média';
    let reason = 'Ação regular do cronograma.';

    if (act.completionPercent === 100) return;

    if (act.status === 'atrasado' || (diff < 0)) {
      priority = 'Muito Alta';
      reason = `Ação vencida há ${Math.abs(diff)} dias. Requer intervenção imediata!`;
    } else if (diff >= 0 && diff <= 10 && act.impactScore >= 8) {
      priority = 'Muito Alta';
      reason = `Prazo apertado (${diff} dias) para ação de altíssimo impacto estratégico.`;
    } else if (diff >= 0 && diff <= 15) {
      priority = 'Alta';
      reason = `Vence em ${diff} dias. Progresso atual: ${act.completionPercent}%.`;
    } else if (act.impactScore >= 9 && act.completionPercent < 30) {
      priority = 'Alta';
      reason = `Ação estratégica crucial com baixo progresso de execução.`;
    } else if (diff > 45) {
      priority = 'Baixa';
      reason = `Vencimento distante (${diff} dias). Monitoramento padrão.`;
    }

    prioritizedTasks.push({
      title: act.title,
      priority,
      reason,
      responsible: act.responsible
    });
  });

  // Sort priorities: Muito Alta, Alta, Média, Baixa
  const priorityOrder = { 'Muito Alta': 0, 'Alta': 1, 'Média': 2, 'Baixa': 3 };
  prioritizedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6" id="system-intelligence">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" />
          <div>
            <h2 className="font-bold text-base leading-none">Inteligência Analítica da Coordenadoria</h2>
            <p className="text-xs text-blue-100 mt-1.5 font-medium">Diagnóstico automático do Plano de Trabalho para Crateús</p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-mono font-medium border border-white/10">
          Data do Sistema: 10/07/2026
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1.5">
        <button
          onClick={() => setActivePanel('today')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
            activePanel === 'today'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
          id="btn-intel-today"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          O que fazer hoje
          {todayActivities.length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activePanel === 'today' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
              {todayActivities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActivePanel('overdue')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
            activePanel === 'overdue'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
          id="btn-intel-overdue"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          O que está atrasado
          {overdueActivities.length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse ${activePanel === 'overdue' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'}`}>
              {overdueActivities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActivePanel('next')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
            activePanel === 'next'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
          id="btn-intel-next"
        >
          <Calendar className="h-3.5 w-3.5" />
          Próximas entregas
          {nextDeliveries.length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activePanel === 'next' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
              {nextDeliveries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActivePanel('risk')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
            activePanel === 'risk'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
          id="btn-intel-risk"
        >
          <Flame className="h-3.5 w-3.5" />
          Metas em risco
          {riskyMetas.length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activePanel === 'risk' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'}`}>
              {riskyMetas.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActivePanel('priority')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all cursor-pointer ${
            activePanel === 'priority'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
          id="btn-intel-priority"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Sugestões de prioridade
        </button>
      </div>

      {/* Panel Content */}
      <div className="p-4 bg-white min-h-[140px]">
        {/* TODAY PANEL */}
        {activePanel === 'today' && (
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium">Atividades previstas, atendimentos agendados ou ações em foco para hoje:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayActivities.map((act, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100/80 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    act.type === 'visit' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {act.type === 'visit' ? <Calendar className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase ${
                        act.tag.includes('Urgente') || act.tag.includes('Atrasada')
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {act.tag}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mt-1 truncate">{act.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{act.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OVERDUE PANEL */}
        {activePanel === 'overdue' && (
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium">As seguintes pendências foram detectadas no cronograma de Crateús:</p>
            {overdueActivities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-emerald-600 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-5 w-5" /> Excelente! Nenhuma pendência em atraso no sistema.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {overdueActivities.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2.5 bg-red-50/50 hover:bg-red-50 rounded-lg border border-red-100 transition-all">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-sm">
                          {act.type}
                        </span>
                        <span className="text-xs font-mono text-red-600 font-medium">Vencido há {act.days} dias</span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 mt-1 truncate">{act.title}</h4>
                      <p className="text-xs text-gray-600 truncate">{act.extra}</p>
                    </div>
                    <div className="text-xs font-bold text-red-700 whitespace-nowrap px-2.5 py-1 bg-red-100 rounded-sm">
                      Pendente
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NEXT DELIVERIES PANEL */}
        {activePanel === 'next' && (
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium">Entregas programadas para os próximos 30 dias:</p>
            {nextDeliveries.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">Nenhuma entrega programada para os próximos 30 dias.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {nextDeliveries.map((del, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-teal-50/40 hover:bg-teal-50 rounded-lg border border-teal-100 transition-all">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-medium px-2 py-0.5 rounded-sm">
                          {del.category}
                        </span>
                        <span className="text-xs text-teal-700 font-medium">Vence em {del.daysLeft} dias ({del.date})</span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mt-1 truncate">{del.title}</h4>
                      <p className="text-xs text-gray-600">Responsável: {del.responsible}</p>
                    </div>
                    <div className="text-xs font-mono text-gray-500 font-semibold px-2 py-1 bg-white rounded-md border border-gray-100 shrink-0">
                      Falta {del.daysLeft}d
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RISK PANEL */}
        {activePanel === 'risk' && (
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium">Metas estratégicas que necessitam de atenção preventiva:</p>
            {riskyMetas.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-emerald-600 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-5 w-5" /> Todas as metas estão progredindo em ritmo saudável!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {riskyMetas.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border bg-amber-50/30 border-amber-200 hover:bg-amber-50 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                        m.level === 'Crítico' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Risco: {m.level}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">Progresso Geral: {m.percent}%</span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 truncate">{m.title}</h4>
                    <p className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {m.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRIORITY PANEL */}
        {activePanel === 'priority' && (
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium">Tarefas sugeridas ordenadas dinamicamente por nível de prioridade operacional:</p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {prioritizedTasks.slice(0, 8).map((task, idx) => (
                <div key={idx} className="flex gap-2.5 items-start p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-lg border border-slate-100 transition-all">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-wider w-[75px] text-center ${
                    task.priority === 'Muito Alta'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : task.priority === 'Alta'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : task.priority === 'Média'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {task.priority}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-gray-900 leading-tight">{task.title}</h4>
                    <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{task.reason}</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">Resp: {task.responsible}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
