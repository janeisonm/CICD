import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { PeriodType, School, WorkPlanGoal, Project } from '../types';
import { 
  Award, BarChart3, Building2, Calendar, CheckSquare, 
  ChevronRight, CircleDot, Database, GraduationCap, 
  HelpCircle, Wifi, Wrench 
} from 'lucide-react';

export const DashboardTab: React.FC = () => {
  const { state, currentUser } = useStrategicState();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('mensal');
  const [comparisonSelection, setComparisonSelection] = useState<string>('jan-feb');

  // --- STATS CALCULATIONS ---
  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(g => g.status === 'concluido').length;
  const inProgressGoals = state.goals.filter(g => g.status === 'em_andamento').length;
  const overdueGoals = state.goals.filter(g => g.status === 'atrasado').length;

  // Actions
  let totalActions = 0;
  let completedActions = 0;
  let totalMicroactions = 0;
  let completedMicroactions = 0;
  let totalActionProgressSum = 0;

  state.goals.forEach(goal => {
    goal.actions.forEach(act => {
      totalActions++;
      totalActionProgressSum += act.completionPercent;
      if (act.completionPercent === 100) {
        completedActions++;
      }
      totalMicroactions += act.microactionsCount;
      completedMicroactions += act.microactionsCompleted;
    });
  });

  const overallWorkPlanProgress = totalActions > 0 ? Math.round(totalActionProgressSum / totalActions) : 0;

  // Projects
  const totalProjects = state.projects.length;
  const activeProjects = state.projects.filter(p => p.status === 'ativo').length;
  const completedProjects = state.projects.filter(p => p.status === 'finalizado').length;

  // Schools
  const totalSchools = state.schools.length;
  const schoolsServed = state.schools.filter(s => s.status === 'atendida' || s.visitsCount > 0).length;
  const schoolsPending = totalSchools - schoolsServed;

  // Visitas, Formações, Feiras
  const technicalVisitsDone = state.visits.filter(v => v.status === 'realizada').length;
  const formationsDone = state.formations.filter(f => f.status === 'realizada').length;
  const scienceFairsDone = state.fairs.filter(fr => fr.status === 'realizada').length;

  // --- IGD (INDICADOR GERAL DE DESEMPENHO) CALCULATION ---
  // Let's create a robust mathematical model
  // 1. Work Plan Actions Progress: weight 40%
  const f_workPlan = overallWorkPlanProgress;

  // 2. Deadlines execution (percentage of non-overdue active actions): weight 15%
  // active actions that are overdue
  const nowStr = '2026-07-10';
  const overdueActionsCount = state.goals.reduce((acc, goal) => {
    return acc + goal.actions.filter(a => a.status === 'atrasado' || (a.completionPercent < 100 && a.dueDate < nowStr)).length;
  }, 0);
  const f_deadlines = totalActions > 0 ? Math.round(((totalActions - overdueActionsCount) / totalActions) * 100) : 100;

  // 3. Schools Served: weight 15%
  const f_schools = totalSchools > 0 ? Math.round((schoolsServed / totalSchools) * 100) : 100;

  // 4. Projects Execution (average project completion %): weight 10%
  const totalProjProgressSum = state.projects.reduce((acc, p) => acc + p.completionPercent, 0);
  const f_projects = totalProjects > 0 ? Math.round(totalProjProgressSum / totalProjects) : 100;

  // 5. Connectivity Level (percentage of schools with >= 30 Mbps internet): weight 10%
  const highSpeedSchools = state.schools.filter(s => s.internetSpeedMbps >= 30).length;
  const f_connectivity = totalSchools > 0 ? Math.round((highSpeedSchools / totalSchools) * 100) : 100;

  // 6. Infrastructure health (recovered computers / cataloged computers): weight 10%
  let totalCataloged = 0;
  let totalRecovered = 0;
  state.schools.forEach(s => {
    totalCataloged += s.equipmentCataloged;
    totalRecovered += s.equipmentRecovered;
  });
  const f_infrastructure = totalCataloged > 0 ? Math.round((totalRecovered / totalCataloged) * 100) : 100;

  // Overall IGD weighted sum
  const igdScore = Math.round(
    (f_workPlan * 0.4) +
    (f_deadlines * 0.15) +
    (f_schools * 0.15) +
    (f_projects * 0.1) +
    (f_connectivity * 0.1) +
    (f_infrastructure * 0.1)
  );

  // Classification details
  let igdColorClass = 'text-red-500';
  let igdBgClass = 'bg-red-500';
  let igdFillClass = '#ef4444'; // Tailwind red-500
  let igdClassification = 'Atenção';
  let igdDescription = 'A coordenadoria necessita de ações imediatas de destravamento e suporte técnico.';

  if (igdScore > 90) {
    igdColorClass = 'text-blue-600';
    igdBgClass = 'bg-blue-600';
    igdFillClass = '#2563eb'; // Tailwind blue-600
    igdClassification = 'Excelência';
    igdDescription = 'Desempenho excelente com metas no prazo, escolas conectadas e alta resolutividade.';
  } else if (igdScore > 70) {
    igdColorClass = 'text-emerald-600';
    igdBgClass = 'bg-emerald-600';
    igdFillClass = '#059669'; // Tailwind emerald-600
    igdClassification = 'Bom desempenho';
    igdDescription = 'Ritmo consistente de entregas, com boa aceitação nas escolas de Crateús.';
  } else if (igdScore > 40) {
    igdColorClass = 'text-amber-500';
    igdBgClass = 'bg-amber-500';
    igdFillClass = '#f59e0b'; // Tailwind amber-500
    igdClassification = 'Em desenvolvimento';
    igdDescription = 'Estruturação em andamento. Há pontos de gargalo elétrico e conexões pendentes.';
  }

  // --- DYNAMIC COMPARATIVE DATA ---
  // The user wants comparing by period (monthly, bimonthly, quarterly, semiannual, annual)
  // Let's model these comparative datasets dynamically.
  // We'll prepare a helper to return comparisons for:
  // - Actions completed (Evolução das Ações)
  // - Metas progress (Evolução das Metas)
  // - Projects count (Evolução de Projetos)
  // - Tech visits (Evolução de Visitas Técnicas)
  // - Connectivity (Average Speed Mbps)

  const getComparativeData = () => {
    switch (selectedPeriod) {
      case 'mensal':
        if (comparisonSelection === 'jan-feb') {
          return {
            title: 'Comparativo Mensal (Janeiro × Fevereiro 2026)',
            labelA: 'Janeiro',
            labelB: 'Fevereiro',
            actions: { a: 2, b: 4, unit: 'ações concluídas' },
            goals: { a: 20, b: 35, unit: '% progresso médio' },
            projects: { a: 1, b: 2, unit: 'projetos ativos' },
            visits: { a: 1, b: 2, unit: 'visitas realizadas' },
            internet: { a: 18, b: 24, unit: 'velocidade média (Mbps)' },
            formations: { a: 0, b: 1, unit: 'formações' },
            fairs: { a: 0, b: 0, unit: 'feiras realizadas' },
            innovation: { a: 1, b: 2, unit: 'indicador de inovação (1-10)' }
          };
        } else {
          // May x June default
          return {
            title: 'Comparativo Mensal (Maio × Junho 2026)',
            labelA: 'Maio',
            labelB: 'Junho',
            actions: { a: 8, b: 12, unit: 'ações concluídas' },
            goals: { a: 52, b: 68, unit: '% progresso médio' },
            projects: { a: 3, b: 3, unit: 'projetos ativos' },
            visits: { a: 3, b: 4, unit: 'visitas realizadas' },
            internet: { a: 42, b: 54, unit: 'velocidade média (Mbps)' },
            formations: { a: 2, b: 3, unit: 'formações' },
            fairs: { a: 1, b: 3, unit: 'feiras realizadas' },
            innovation: { a: 5, b: 7, unit: 'indicador de inovação (1-10)' }
          };
        }
      case 'bimestral':
        return {
          title: 'Comparativo Bimestral (1º Bimestre × 2º Bimestre)',
          labelA: '1º Bim (Jan/Fev)',
          labelB: '2º Bim (Mar/Abr)',
          actions: { a: 6, b: 11, unit: 'ações concluídas' },
          goals: { a: 25, b: 44, unit: '% progresso médio' },
          projects: { a: 2, b: 3, unit: 'projetos ativos' },
          visits: { a: 2, b: 4, unit: 'visitas realizadas' },
          internet: { a: 20, b: 34, unit: 'velocidade média (Mbps)' },
          formations: { a: 1, b: 2, unit: 'formações' },
          fairs: { a: 0, b: 1, unit: 'feiras realizadas' },
          innovation: { a: 2, b: 4, unit: 'indicador de inovação (1-10)' }
        };
      case 'trimestral':
        return {
          title: 'Comparativo Trimestral (T1 × T2 2026)',
          labelA: 'T1 (Jan-Mar)',
          labelB: 'T2 (Abr-Jun)',
          actions: { a: 8, b: 16, unit: 'ações concluídas' },
          goals: { a: 30, b: 58, unit: '% progresso médio' },
          projects: { a: 2, b: 3, unit: 'projetos ativos' },
          visits: { a: 3, b: 5, unit: 'visitas realizadas' },
          internet: { a: 25, b: 51, unit: 'velocidade média (Mbps)' },
          formations: { a: 1, b: 2, unit: 'formações' },
          fairs: { a: 0, b: 4, unit: 'feiras realizadas' },
          innovation: { a: 3, b: 6, unit: 'indicador de inovação (1-10)' }
        };
      case 'semestral':
        return {
          title: 'Comparativo Semestral (1º Semestre × 2º Semestre)',
          labelA: '1º Semestre (Realizado)',
          labelB: '2º Semestre (Projeção)',
          actions: { a: 18, b: 25, unit: 'ações concluídas' },
          goals: { a: 62, b: 88, unit: '% progresso médio' },
          projects: { a: 3, b: 4, unit: 'projetos ativos' },
          visits: { a: 6, b: 8, unit: 'visitas realizadas' },
          internet: { a: 52, b: 78, unit: 'velocidade média (Mbps)' },
          formations: { a: 3, b: 4, unit: 'formações' },
          fairs: { a: 4, b: 6, unit: 'feiras realizadas' },
          innovation: { a: 6, b: 9, unit: 'indicador de inovação (1-10)' }
        };
      case 'anual':
        return {
          title: 'Comparativo Anual (Ano Anterior × Ano Atual)',
          labelA: 'Ano Anterior (2025)',
          labelB: 'Ano Atual (2026)',
          actions: { a: 12, b: totalActions, unit: 'ações cadastradas' },
          goals: { a: 45, b: overallWorkPlanProgress, unit: '% progresso médio' },
          projects: { a: 2, b: totalProjects, unit: 'projetos ativos' },
          visits: { a: 8, b: technicalVisitsDone, unit: 'visitas realizadas' },
          internet: { a: 15, b: 44, unit: 'velocidade média (Mbps)' },
          formations: { a: 2, b: state.formations.length, unit: 'formações' },
          fairs: { a: 1, b: state.fairs.length, unit: 'feiras planejadas' },
          innovation: { a: 3, b: 7, unit: 'indicador de inovação (1-10)' }
        };
    }
  };

  const compData = getComparativeData();

  // Draw simple robust custom dynamic SVG bar-chart element for comparison
  const renderComparisonBar = (key: string, title: string, item: { a: number; b: number; unit: string }) => {
    const maxVal = Math.max(item.a, item.b, 1);
    const pctA = Math.round((item.a / maxVal) * 100);
    const pctB = Math.round((item.b / maxVal) * 100);

    return (
      <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-300" key={key}>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">{title}</h4>
          <span className="text-[10px] text-slate-400 font-mono italic">{item.unit}</span>
        </div>
        
        <div className="space-y-4 mt-4">
          {/* Bar A */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="truncate max-w-[150px] font-medium">{compData.labelA}</span>
              <span className="font-bold font-mono text-slate-700">{item.a}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-300 rounded-full transition-all duration-500" 
                style={{ width: `${pctA}%` }}
              />
            </div>
          </div>

          {/* Bar B */}
          <div>
            <div className="flex justify-between text-xs text-slate-800 mb-1 font-semibold">
              <span className="truncate max-w-[150px]">{compData.labelB}</span>
              <span className="font-bold font-mono text-blue-600">{item.b}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-xs" 
                style={{ width: `${pctB}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="dashboard-tab">
      
      {/* ACTIVE USER WELCOME BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 p-5 rounded-3xl border border-emerald-500/40 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="banner-active-user-dashboard">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center font-black text-xl text-white shadow-md shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
                Sessão Ativa
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {currentUser?.email}
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5 flex items-center gap-2">
              Usuário Conectado: <span className="text-emerald-300">{currentUser?.name}</span>
            </h2>
            <p className="text-xs text-slate-300">
              {currentUser?.roleTitle} • <strong className="text-emerald-400">{currentUser?.role === 'administrador' ? 'Administrador Geral da Coordenadoria' : 'Membro de Equipe Tecno-Pedagógica'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-emerald-950/80 p-2.5 rounded-2xl border border-emerald-800/60 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-emerald-200 font-medium">Dados Sincronizados no Dispositivo</span>
        </div>
      </div>

      {/* --- EXECUTIVE ROW: IGD GAUGE & OVERALL PERC --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Velocímetro IGD */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md" id="igd-gauge-card">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indicador Geral de Desempenho (IGD)</span>
              <HelpCircle className="h-4 w-4 text-slate-300 hover:text-slate-500 transition-colors cursor-help" title="Pontuação ponderada de metas, prazos, escolas atendidas, conectividade e equipamentos." />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Desempenho da Coordenadoria</h3>
          </div>

          {/* Gauge representation using beautiful SVG */}
          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative h-32 w-56 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 110">
                {/* Arc Background */}
                <path 
                  d="M20 100 A80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="#f1f5f9" 
                  strokeWidth="20" 
                  strokeLinecap="round" 
                />
                
                {/* Colored Zones (low, mid, high, excel) */}
                <path 
                  d="M20 100 A80 80 0 0 1 84 40" 
                  fill="none" 
                  stroke="#fca5a5" // red-300
                  strokeWidth="6" 
                />
                <path 
                  d="M84 40 A80 80 0 0 1 130 46" 
                  fill="none" 
                  stroke="#fde047" // yellow-300
                  strokeWidth="6" 
                />
                <path 
                  d="M130 46 A80 80 0 0 1 164 74" 
                  fill="none" 
                  stroke="#6ee7b7" // emerald-300
                  strokeWidth="6" 
                />
                <path 
                  d="M164 74 A80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke="#93c5fd" // blue-300
                  strokeWidth="6" 
                />

                {/* Actual value colored arc */}
                <path 
                  d="M20 100 A80 80 0 0 1 180 100" 
                  fill="none" 
                  stroke={igdFillClass} 
                  strokeWidth="16" 
                  strokeLinecap="round" 
                  strokeDasharray="251.3" 
                  strokeDashoffset={251.3 - (251.3 * (igdScore / 100))}
                  className="transition-all duration-1000 ease-out"
                />

                {/* Center needle */}
                <g transform={`rotate(${(igdScore * 1.8) - 180} 100 100)`}>
                  <line x1="100" y1="100" x2="100" y2="25" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  <polygon points="97,100 100,20 103,100" fill="#334155" />
                  <circle cx="100" cy="100" r="8" fill="#1e293b" />
                </g>
              </svg>

              {/* Score text overlay */}
              <div className="absolute bottom-0 text-center">
                <span className="text-3xl font-extrabold font-mono text-slate-800">{igdScore}%</span>
                <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-3 py-0.5 rounded-full inline-block ${igdBgClass} text-white`}>
                  {igdClassification}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500 px-4 leading-relaxed font-medium">
              {igdDescription}
            </p>
          </div>
        </div>

        {/* Resumo Geral Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6" id="stats-summary-grid">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-emerald-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plano de Trabalho</span>
              <CheckSquare className="h-4 w-4 shrink-0 text-emerald-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{overallWorkPlanProgress}%</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Percentual geral de execução</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-blue-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total de Metas</span>
              <Award className="h-4 w-4 shrink-0 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{totalGoals}</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                <span className="text-emerald-600 font-bold">{completedGoals} concluidas</span> | {inProgressGoals} andam
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-red-500">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Metas em Atraso</span>
              <CircleDot className="h-4 w-4 shrink-0 text-red-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-red-600">{overdueGoals}</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Requer atenção imediata</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Microações</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{completedMicroactions}</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">De {totalMicroactions} microações</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-teal-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projetos Ativos</span>
              <Database className="h-4 w-4 shrink-0 text-teal-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{activeProjects}</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">{completedProjects} concluídos com sucesso</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-indigo-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Escolas de Crateús</span>
              <Building2 className="h-4 w-4 shrink-0 text-indigo-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{schoolsServed} <span className="text-xs font-normal text-slate-400">/ {totalSchools}</span></div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                <span className="text-emerald-600 font-bold">{schoolsServed} atendidas</span> | <span className="text-red-500 font-bold">{schoolsPending} pendentes</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-orange-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visitas Técnicas</span>
              <Wrench className="h-4 w-4 shrink-0 text-orange-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{technicalVisitsDone}</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Relatórios homologados</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-amber-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Formações Realizadas</span>
              <GraduationCap className="h-4 w-4 shrink-0 text-amber-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{formationsDone}</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Professores capacitados</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
            <div className="flex justify-between items-start text-indigo-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feiras de Ciências</span>
              <Calendar className="h-4 w-4 shrink-0 text-indigo-500" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold font-mono text-slate-900">{scienceFairsDone}</div>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Nas escolas municipais</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- COMPARATIVE EVOLUTION GRAPH SECTION --- */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="comparative-evolution-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Indicadores de Evolução Comparativos
            </h3>
            <p className="text-xs text-slate-500 mt-1">Selecione o período de comparação para analisar os avanços da Coordenadoria</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/50 shadow-xs">
              {(['mensal', 'bimestral', 'trimestral', 'semestral', 'anual'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    // Select a default comparison depending on the period
                    if (p === 'mensal') setComparisonSelection('jan-feb');
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedPeriod === p 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                  id={`btn-period-${p}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {selectedPeriod === 'mensal' && (
              <select
                value={comparisonSelection}
                onChange={(e) => setComparisonSelection(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-semibold rounded-full px-4 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs"
                id="select-month-comparison"
              >
                <option value="jan-feb">Janeiro × Fevereiro</option>
                <option value="may-jun">Maio × Junho</option>
              </select>
            )}
          </div>
        </div>

        {/* Dynamic Evolution Content Header */}
        <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-2xl flex items-center justify-between mb-6">
          <span className="font-bold text-sm text-blue-800 uppercase tracking-wide">
            {compData.title}
          </span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="h-2 w-4 bg-slate-300 rounded-sm inline-block"></span>
              {compData.labelA}
            </span>
            <span className="flex items-center gap-1 text-blue-600 font-semibold">
              <span className="h-2 w-4 bg-blue-600 rounded-sm inline-block"></span>
              {compData.labelB}
            </span>
          </div>
        </div>

        {/* Custom Visual Comparative Grid - 8 Graphs Requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderComparisonBar('actions', 'Evolução das Ações', compData.actions)}
          {renderComparisonBar('goals', 'Evolução das Metas', compData.goals)}
          {renderComparisonBar('projects', 'Evolução dos Projetos', compData.projects)}
          {renderComparisonBar('visits', 'Evolução das Visitas Técnicas', compData.visits)}
          {renderComparisonBar('connectivity', 'Evolução da Conectividade', compData.internet)}
          {renderComparisonBar('formations', 'Evolução das Formações', compData.formations)}
          {renderComparisonBar('fairs', 'Evolução das Feiras', compData.fairs)}
          {renderComparisonBar('innovation', 'Indicadores de Inovação', compData.innovation)}
        </div>

        {/* Dynamic Qualitative Comparison Text based on Selection */}
        <div className="bg-slate-50 rounded-2xl p-5 mt-6 border border-slate-100">
          <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider mb-2">Análise Técnica Comparativa</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {selectedPeriod === 'mensal' && comparisonSelection === 'jan-feb' && (
              'No primeiro bimestre, a Coordenadoria focou majoritariamente no planejamento estratégico e no levantamento físico de inventários (Janeiro), evoluindo no mês de Fevereiro para o início efetivo das capacitações e homologações de internet nas primeiras escolas atendidas.'
            )}
            {selectedPeriod === 'mensal' && comparisonSelection === 'may-jun' && (
              'O período de Maio a Junho de 2026 registrou um crescimento excepcional na execução de Feiras de Ciências (passando de 1 para 3 executadas) e na evolução geral do Plano de Trabalho, impulsionado pela liberação de equipamentos recuperados do mutirão Inova Escola.'
            )}
            {selectedPeriod === 'bimestral' && (
              'A análise entre o 1º Bimestre (foco de base e diagnóstico) e o 2º Bimestre (foco de suporte e reestruturação) aponta um aumento de 83% no número de ações executadas e uma ampliação considerável na velocidade média de internet mensurada nas visitas técnicas.'
            )}
            {selectedPeriod === 'trimestral' && (
              'A transição do primeiro trimestre (T1) para o segundo trimestre (T2) consolidou a eficiência das visitas técnicas. Com os laboratórios elétricos recuperados, a Coordenadoria atingiu 58% de progresso médio do plano global, além de estruturar o edital da Feira Científica FEMCITE.'
            )}
            {selectedPeriod === 'semestral' && (
              'A comparação semestral demonstra uma aceleração projetada de 38% para o segundo semestre de 2026. Espera-se a finalização do projeto Crateús Conectado e a expansão das caravanas tecnológicas (Cultura Maker) nas escolas da zona rural no semestre final.'
            )}
            {selectedPeriod === 'anual' && (
              'Comparando o ano atual (2026) com o ano anterior (2025), o IGD evoluiu significativamente, saindo de um patamar médio de 45% de conformidade de metas para o atual progresso otimizado, consolidando a infraestrutura de fibra óptica em praticamente todas as escolas municipais.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
