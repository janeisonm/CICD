import React from 'react';
import { useStrategicState } from '../stateContext';
import { Award, CheckCircle, Star, Trophy, Users } from 'lucide-react';

export const AchievedGoalsTab: React.FC = () => {
  const { state } = useStrategicState();

  // --- EXTRACT CONCLUDED RECORDS ---
  // Goals
  const concludedGoals = state.goals.filter(g => g.status === 'concluido');
  
  // Actions
  const concludedActions: { title: string; category: string; dueDate: string; goalTitle: string; responsible: string }[] = [];
  state.goals.forEach(g => {
    g.actions.forEach(a => {
      if (a.completionPercent === 100 || a.status === 'concluido') {
        concludedActions.push({
          title: a.title,
          category: a.category,
          dueDate: a.dueDate,
          goalTitle: g.title,
          responsible: a.responsible
        });
      }
    });
  });

  // Projects
  const completedProjects = state.projects.filter(p => p.status === 'finalizado');

  // Schools Served
  const servedSchools = state.schools.filter(s => s.visitsCount > 0 || s.status === 'atendida');

  // Science Fairs Realized
  const completedFairs = state.fairs.filter(f => f.status === 'realizada');

  // --- GROWTH & COMPARATIVE PERCENTAGES (SIMULATED VS PLANNING INITIAL) ---
  const baselineMetrics = {
    connectedSchools: 2, // only 2 schools had fiber internet originally
    avgInternetSpeed: 12, // average speed was 12Mbps
    activeDevices: 18, // only 18 recovered computers active initially
    trainedTeachers: 25, // baseline trained teachers
    fairsDone: 0 // baseline science fairs
  };

  const currentMetrics = {
    connectedSchools: state.schools.filter(s => s.internetSpeedMbps >= 25 && s.internetQuality !== 'Sem Conexão').length,
    avgInternetSpeed: state.schools.length > 0 ? Math.round(state.schools.reduce((acc, s) => acc + s.internetSpeedMbps, 0) / state.schools.length) : 0,
    activeDevices: state.schools.reduce((acc, s) => acc + s.equipmentRecovered, 0),
    trainedTeachers: state.goals.find(g => g.id === 'g3')?.currentValue || 95,
    fairsDone: completedFairs.length
  };

  const getGrowthPercent = (current: number, baseline: number) => {
    if (baseline === 0) return current * 100; // handle division by zero or absolute growth
    return Math.round(((current - baseline) / baseline) * 100);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="achieved-goals-tab">
      
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 rounded-3xl text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-yellow-300 shrink-0 border border-white/10">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-xl sm:text-2xl tracking-tight">Objetivos Alcançados & Impacto</h2>
            <p className="text-xs text-blue-100 mt-1.5 max-w-2xl font-medium leading-relaxed">
              Demonstração objetiva dos avanços, crescimento percentual e metas concluídas pela Coordenadoria de Inovações e Culturas Digitais perante a Secretaria Municipal de Educação.
            </p>
          </div>
        </div>
      </div>

      {/* --- CUMULATIVE RESULTS STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{concludedGoals.length}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metas Macro Concluídas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{concludedActions.length}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ações Operacionais</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="h-10 w-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{completedProjects.length}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projetos Finalizados</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{servedSchools.length}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escolas Atendidas</p>
          </div>
        </div>

      </div>

      {/* --- GROW RATE GRID: COMPARISON WITH BASELINE --- */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1 uppercase tracking-tight">
          <Star className="h-4 w-4 text-blue-600" />
          Percentual de Crescimento vs. Planejamento Inicial (Baseline)
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">Comparativo evolutivo desde o início do ano letivo de 2026</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Growth card: Conectividade */}
          <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conectividade Escolar</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                +{getGrowthPercent(currentMetrics.connectedSchools, baselineMetrics.connectedSchools)}% Crescimento
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <span className="text-2xl font-extrabold text-slate-800 font-mono">{currentMetrics.connectedSchools}</span>
                <span className="text-xs text-slate-400 font-mono font-medium"> / {state.schools.length} escolas</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Original: {baselineMetrics.connectedSchools}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Escolas conectadas à internet estável de banda larga via fibra óptica.</p>
          </div>

          {/* Growth card: Internet Speed */}
          <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Velocidade Média da Rede</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                +{getGrowthPercent(currentMetrics.avgInternetSpeed, baselineMetrics.avgInternetSpeed)}% Velocidade
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <span className="text-2xl font-extrabold text-slate-800 font-mono">{currentMetrics.avgInternetSpeed}</span>
                <span className="text-xs text-slate-400 font-mono font-medium"> Mbps</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Original: {baselineMetrics.avgInternetSpeed} Mbps</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Velocidade de navegação média aferida nas vistorias de campo.</p>
          </div>

          {/* Growth card: Equipamentos Recuperados */}
          <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Computadores Ativados</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                +{getGrowthPercent(currentMetrics.activeDevices, baselineMetrics.activeDevices)}% Recuperados
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <span className="text-2xl font-extrabold text-slate-800 font-mono">{currentMetrics.activeDevices}</span>
                <span className="text-xs text-slate-400 font-mono font-medium"> terminais ativos</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Original: {baselineMetrics.activeDevices}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Computadores recuperados pelo mutirão e disponibilizados nos laboratórios.</p>
          </div>

          {/* Growth card: Professores Formados */}
          <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacitação Pedagógica</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                +{getGrowthPercent(currentMetrics.trainedTeachers, baselineMetrics.trainedTeachers)}% Formados
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <span className="text-2xl font-extrabold text-slate-800 font-mono">{currentMetrics.trainedTeachers}</span>
                <span className="text-xs text-slate-400 font-mono font-medium"> docentes</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Original: {baselineMetrics.trainedTeachers}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Professores capacitados no uso educacional de ferramentas digitais e Workspace.</p>
          </div>

          {/* Growth card: Feiras de Ciências */}
          <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feiras Científicas</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {currentMetrics.fairsDone} Realizadas
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <span className="text-2xl font-extrabold text-slate-800 font-mono">{currentMetrics.fairsDone}</span>
                <span className="text-xs text-slate-400 font-mono font-medium"> mostras escolares</span>
              </div>
              <span className="text-xs text-slate-500 font-mono font-medium">Original: {baselineMetrics.fairsDone}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Feiras de ciências concluídas, integrando robótica e iniciação à pesquisa.</p>
          </div>

          {/* Growth card: Projetos finalizados */}
          <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projetos de Impacto</span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {completedProjects.length} Finalizados
              </span>
            </div>
            <div className="flex justify-between items-baseline mt-2">
              <div>
                <span className="text-2xl font-extrabold text-slate-800 font-mono">{completedProjects.length}</span>
                <span className="text-xs text-slate-400 font-mono font-medium"> de {state.projects.length} projetos</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Ativos: {state.projects.filter(p => p.status === 'ativo').length}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Projetos de fomento com orçamento liquidado e resultados aferidos.</p>
          </div>

        </div>
      </div>

      {/* --- DETAILED LIST OF ACCOMPLISHMENTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Concluded Goals List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 uppercase tracking-tight">
            <Award className="h-4 w-4 text-blue-600" />
            Grandes Metas e Projetos Concluídos
          </h3>

          {concludedGoals.length === 0 && completedProjects.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Nenhuma meta macro ou projeto marcado com 100% de conclusão ainda. Complete as ações correlatas para destravar estes troféus!</p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {completedProjects.map(proj => (
                <div key={proj.id} className="p-4 bg-blue-50/20 border border-blue-100/50 rounded-2xl">
                  <div className="flex justify-between items-center text-[10px] text-blue-700 font-bold mb-1">
                    <span>PROJETO CONCLUÍDO</span>
                    <span className="bg-blue-100 px-2 py-0.5 rounded-full text-[9px]">100% Execução</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{proj.name}</h4>
                  <ul className="text-[10px] text-slate-600 list-disc pl-4 mt-2 space-y-0.5 font-medium">
                    {proj.results.map((res, i) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {concludedGoals.map(goal => (
                <div key={goal.id} className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl">
                  <div className="flex justify-between items-center text-[10px] text-indigo-700 font-bold mb-1">
                    <span>META DO PLANO CONCLUÍDA</span>
                    <span className="bg-indigo-100 px-2 py-0.5 rounded-full text-[9px]">100% Alvo</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{goal.title}</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed font-medium">{goal.description}</p>
                  <p className="text-[9px] text-indigo-600 font-bold mt-2">Concluído em: {goal.dueDate}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concluded Actions Timeline/List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 uppercase tracking-tight">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            Últimas Ações Operacionais Concluídas
          </h3>

          {concludedActions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Nenhuma ação operacional menor foi concluída ainda.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {concludedActions.map((act, i) => (
                <div key={i} className="p-3 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-200 flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 leading-tight">{act.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">Meta: {act.goalTitle}</p>
                    <div className="flex gap-2 text-[9px] text-slate-400 mt-2 font-semibold uppercase tracking-wider">
                      <span>Responsável: {act.responsible}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-bold">Concluído</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
