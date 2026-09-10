import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { 
  AlertTriangle, Calendar, CheckCircle2, 
  Clock, Hourglass, Play, Sparkles 
} from 'lucide-react';

type PeriodType = 'all' | 'iniciadas' | 'concluidas' | 'proximas' | 'atrasadas' | 'mes' | 'futuros';

export const TimelineTab: React.FC = () => {
  const { state } = useStrategicState();
  const [filter, setFilter] = useState<PeriodType>('all');

  const currentDateStr = '2026-07-30';
  const currentDate = new Date(currentDateStr);

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Compile timeline events from actions, projects, visits, formations, fairs
  interface TimelineEvent {
    id: string;
    type: 'acao' | 'projeto' | 'visita' | 'formacao' | 'feira';
    title: string;
    date: string;
    status: 'iniciado' | 'concluido' | 'atrasado' | 'planejado';
    badge: string;
    details: string;
    responsible: string;
    daysDiff: number;
    isCurrentMonth: boolean;
  }

  const events: TimelineEvent[] = [];

  // Parse Actions
  state.goals.forEach(goal => {
    goal.actions.forEach(act => {
      const daysDiff = getDaysDiff(act.dueDate);
      const isCurrentMonth = act.dueDate.startsWith('2026-07');
      
      let evStatus: TimelineEvent['status'] = 'planejado';
      if (act.completionPercent === 100) {
        evStatus = 'concluido';
      } else if (act.status === 'atrasado' || daysDiff < 0) {
        evStatus = 'atrasado';
      } else if (act.completionPercent > 0) {
        evStatus = 'iniciado';
      }

      events.push({
        id: `ev_act_${act.id}`,
        type: 'acao',
        title: act.title,
        date: act.dueDate,
        status: evStatus,
        badge: 'Ação do Plano',
        details: `Meta Relacionada: ${goal.title} | Progresso: ${act.completionPercent}%`,
        responsible: act.responsible,
        daysDiff,
        isCurrentMonth
      });
    });
  });

  // Parse Projects
  state.projects.forEach(p => {
    const daysDiff = getDaysDiff(p.dueDate);
    const isCurrentMonth = p.dueDate.startsWith('2026-07');
    let evStatus: TimelineEvent['status'] = 'planejado';
    
    if (p.status === 'finalizado') evStatus = 'concluido';
    else if (p.status === 'ativo') evStatus = 'iniciado';
    else if (daysDiff < 0) evStatus = 'atrasado';

    events.push({
      id: `ev_proj_${p.id}`,
      type: 'projeto',
      title: `Projeto: ${p.name}`,
      date: p.dueDate,
      status: evStatus,
      badge: 'Projeto Estratégico',
      details: `${p.description} | Progresso: ${p.completionPercent}%`,
      responsible: p.responsible,
      daysDiff,
      isCurrentMonth
    });
  });

  // Parse Visits
  state.visits.forEach(v => {
    const daysDiff = getDaysDiff(v.date);
    const isCurrentMonth = v.date.startsWith('2026-07');
    let evStatus: TimelineEvent['status'] = 'planejado';

    if (v.status === 'realizada') evStatus = 'concluido';
    else if (daysDiff < 0) evStatus = 'atrasado';

    events.push({
      id: `ev_visit_${v.id}`,
      type: 'visita',
      title: `Visita Técnica: ${v.schoolName}`,
      date: v.date,
      status: evStatus,
      badge: 'Visita de Campo',
      details: v.details,
      responsible: v.responsible,
      daysDiff,
      isCurrentMonth
    });
  });

  // Parse Formations
  state.formations.forEach(f => {
    const daysDiff = getDaysDiff(f.date);
    const isCurrentMonth = f.date.startsWith('2026-07');
    let evStatus: TimelineEvent['status'] = 'planejado';

    if (f.status === 'realizada') evStatus = 'concluido';
    else if (daysDiff < 0) evStatus = 'atrasado';

    events.push({
      id: `ev_form_${f.id}`,
      type: 'formacao',
      title: `Formação: ${f.title}`,
      date: f.date,
      status: evStatus,
      badge: 'Capacitação Docente',
      details: `Tema: ${f.theme} | Público: ${f.audience} | Carga: ${f.hours}h`,
      responsible: 'Coordenadoria Pedagógica',
      daysDiff,
      isCurrentMonth
    });
  });

  // Parse Fairs
  state.fairs.forEach(fr => {
    const daysDiff = getDaysDiff(fr.date);
    const isCurrentMonth = fr.date.startsWith('2026-07');
    let evStatus: TimelineEvent['status'] = 'planejado';

    if (fr.status === 'realizada') evStatus = 'concluido';
    else if (daysDiff < 0) evStatus = 'atrasado';

    events.push({
      id: `ev_fair_${fr.id}`,
      type: 'feira',
      title: `Feira: ${fr.name}`,
      date: fr.date,
      status: evStatus,
      badge: 'Feira de Ciências',
      details: `Escola: ${fr.schoolName} | Projetos Inscritos: ${fr.projectsCount}`,
      responsible: 'Comissão Organizadora',
      daysDiff,
      isCurrentMonth
    });
  });

  // Filter out events/actions up to 30/07/2026 as requested
  const futureOnlyEvents = events.filter(ev => ev.date > '2026-07-30');

  // Sort events chronologically (ascending)
  futureOnlyEvents.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Apply filters
  const filteredEvents = futureOnlyEvents.filter(ev => {
    if (filter === 'all') return true;
    if (filter === 'iniciadas') return ev.status === 'iniciado';
    if (filter === 'concluidas') return ev.status === 'concluido';
    if (filter === 'proximas') return ev.daysDiff >= 0 && ev.daysDiff <= 30 && ev.status !== 'concluido';
    if (filter === 'atrasadas') return ev.status === 'atrasado';
    if (filter === 'mes') return ev.isCurrentMonth;
    if (filter === 'futuros') return ev.daysDiff > 0;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 animate-fade-in" id="timeline-tab">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 pb-5 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Clock className="h-5 w-5 text-blue-600" />
            Linha do Tempo Dinâmica
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Evolução do Plano de Trabalho e eventos institucionais.</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
              Exibindo ações a partir de 31/07/2026
            </span>
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/50 shadow-xs">
          {(['all', 'iniciadas', 'concluidas', 'proximas', 'atrasadas', 'mes', 'futuros'] as const).map((f) => {
            let label = 'Todos';
            let activeTextClass = 'bg-slate-900 text-white shadow-xs';
            if (f === 'iniciadas') { label = 'Iniciadas'; activeTextClass = 'bg-indigo-600 text-white shadow-xs'; }
            else if (f === 'concluidas') { label = 'Concluídas'; activeTextClass = 'bg-emerald-600 text-white shadow-xs'; }
            else if (f === 'proximas') { label = 'Próximas'; activeTextClass = 'bg-amber-600 text-white shadow-xs'; }
            else if (f === 'atrasadas') { label = 'Atrasadas'; activeTextClass = 'bg-red-600 text-white shadow-xs'; }
            else if (f === 'mes') { label = 'Este Mês'; activeTextClass = 'bg-blue-600 text-white shadow-xs'; }
            else if (f === 'futuros') { label = 'Futuros'; activeTextClass = 'bg-sky-600 text-white shadow-xs'; }

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  filter === f ? activeTextClass : 'text-slate-500 hover:text-slate-950'
                }`}
                id={`filter-timeline-${f}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actual Timeline Tree */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/40 rounded-2xl border border-dashed border-slate-100">
          <Hourglass className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Nenhum evento corresponde ao filtro selecionado.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 space-y-8 py-2">
          {filteredEvents.map((ev) => {
            // Pick style depending on event type and status
            let iconBg = 'bg-slate-50 text-slate-500';
            let iconElement = <Clock className="h-4 w-4" />;
            let statusBadgeClass = 'bg-slate-50 text-slate-700 border-slate-200/50';
            let statusLabel = 'Planejado';

            if (ev.status === 'concluido') {
              iconBg = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
              iconElement = <CheckCircle2 className="h-4 w-4" />;
              statusBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
              statusLabel = 'Concluído';
            } else if (ev.status === 'atrasado') {
              iconBg = 'bg-red-50 text-red-600 border border-red-100 animate-pulse';
              iconElement = <AlertTriangle className="h-4 w-4" />;
              statusBadgeClass = 'bg-red-50 text-red-700 border border-red-100';
              statusLabel = 'Atrasado';
            } else if (ev.status === 'iniciado') {
              iconBg = 'bg-indigo-50 text-indigo-600 border border-indigo-100';
              iconElement = <Play className="h-4 w-4" />;
              statusBadgeClass = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
              statusLabel = 'Em Execução';
            }

            // Pick Category/Badge style
            let badgeBg = 'bg-slate-50 text-slate-700 border border-slate-200/50';
            if (ev.type === 'visita') badgeBg = 'bg-cyan-50 text-cyan-700 border border-cyan-100';
            else if (ev.type === 'formacao') badgeBg = 'bg-amber-50 text-amber-700 border border-amber-100';
            else if (ev.type === 'feira') badgeBg = 'bg-purple-50 text-purple-700 border border-purple-100';
            else if (ev.type === 'projeto') badgeBg = 'bg-blue-50 text-blue-700 border border-blue-100';

            return (
              <div key={ev.id} className="relative group" id={`timeline-event-${ev.id}`}>
                {/* Node Dot / Icon */}
                <div className={`absolute -left-[38px] sm:-left-[46px] top-1.5 h-8 w-8 rounded-full flex items-center justify-center shadow-xs transition-all ${iconBg}`}>
                  {iconElement}
                </div>

                {/* Event Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    {/* Event categories */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${badgeBg}`}>
                        {ev.badge}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>
                      {ev.isCurrentMonth && (
                        <span className="text-[9px] font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                          <Sparkles className="h-2.5 w-2.5" /> Este Mês
                        </span>
                      )}
                    </div>

                    {/* Date display */}
                    <div className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      {ev.status !== 'concluido' && ev.daysDiff !== 0 && (
                        <span className={`text-[10px] font-bold ml-1.5 ${ev.daysDiff < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          ({ev.daysDiff < 0 ? `Vencido há ${Math.abs(ev.daysDiff)}d` : `Faltam ${ev.daysDiff}d`})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                    {ev.details}
                  </p>

                  {/* Responsible footer */}
                  <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-50 text-[10px] sm:text-xs text-slate-400">
                    <span>Responsável: <strong className="text-slate-600 font-semibold">{ev.responsible}</strong></span>
                    {ev.type === 'acao' && (
                      <span className="font-mono text-slate-350">Progresso integrado com Dashboard</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
