import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { 
  Calendar, Download, FileSpreadsheet, 
  FileText, ListOrdered, Printer, RefreshCw, Star 
} from 'lucide-react';

export const ReportsTab: React.FC = () => {
  const context = useStrategicState();
  const { state: appState } = context;

  const [selectedReportType, setSelectedReportType] = useState<'executive' | 'monthly' | 'school' | 'project' | 'indicators'>('executive');
  
  const coordinatorName = appState.systemSettings?.coordinatorName || 'Prof. Francisco Reginaldo';
  const coordinatorRole = appState.systemSettings?.coordinatorRole || 'Coordenador de Inovação e Culturas Digitais';
  const logoUrl = appState.systemSettings?.logoUrl;

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(appState.schools[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(appState.projects[0]?.id || '');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const selectedSchool = appState.schools.find(s => s.id === selectedSchoolId) || appState.schools[0];
  const selectedProject = appState.projects.find(p => p.id === selectedProjectId) || appState.projects[0];

  // Helper calculations for reports
  const totalSchools = appState.schools.length;
  const servedSchoolsCount = appState.schools.filter(s => (s.visitsCount && s.visitsCount > 0) || s.status === 'atendida' || (s.internetAccessPoints && s.internetAccessPoints.length > 0) || (s.equipmentRecovered && s.equipmentRecovered > 0)).length;
  
  let totalCataloged = 0;
  let totalRecovered = 0;
  let totalDefective = 0;
  appState.schools.forEach(s => {
    totalCataloged += (s.equipmentCataloged || 0);
    totalRecovered += (s.equipmentRecovered || 0);
    totalDefective += (s.equipmentDefective || 0);
  });

  const totalActions = appState.goals.reduce((acc, g) => acc + (g.actions ? g.actions.length : 0), 0);
  const completedActions = appState.goals.reduce((acc, g) => acc + (g.actions ? g.actions.filter(a => a.completionPercent === 100).length : 0), 0);
  const inProgressActions = appState.goals.reduce((acc, g) => acc + (g.actions ? g.actions.filter(a => a.completionPercent > 0 && a.completionPercent < 100).length : 0), 0);

  const totalFormedTeachers = appState.formations.reduce((acc, f) => acc + (f.participantsCount || 0), 0);

  const overallWorkPlanProgress = Math.round(
    appState.goals.reduce((acc, goal) => {
      if (!goal.actions || goal.actions.length === 0) return acc + (goal.status === 'concluido' ? 100 : 0);
      const avgGoal = goal.actions.reduce((sum, act) => sum + (act.completionPercent || 0), 0) / goal.actions.length;
      return acc + avgGoal;
    }, 0) / (appState.goals.length || 1)
  );

  const completedGoalsList = appState.goals.filter(g => g.status === 'concluido' || (g.actions && g.actions.length > 0 && g.actions.every(a => a.completionPercent === 100)));
  const pendingGoalsList = appState.goals.filter(g => g.status !== 'concluido' && (g.actions.length === 0 || !g.actions.every(a => a.completionPercent === 100)));

  // TRIGGER SIMULATED DOWNLOADS
  const handleDownload = (format: 'pdf' | 'excel' | 'word') => {
    setIsDownloading(format);
    setTimeout(() => {
      setIsDownloading(null);
      
      // Build a realistic file content
      let filename = `relatorio_${selectedReportType}_${Date.now()}`;
      let mimeType = 'text/plain';
      let content = '';

      if (format === 'pdf') {
        window.print();
        return;
      } else if (format === 'excel') {
        filename += '.xlsx';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        content = 'ID,Nome,Informacoes,Indicadores\n1,Relatorio Crateus,' + selectedReportType + ',100%';
      } else if (format === 'word') {
        filename += '.docx';
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        content = 'RELATORIO DE GESTAO ESTRATEGICA - CRATEUS\n' + selectedReportType.toUpperCase();
      }

      // Download trigger
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="reports-tab">
      
      {/* Configuration Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 uppercase tracking-tight">
            <FileText className="h-5 w-5 text-blue-600" />
            Central de Relatórios Gerenciais
          </h2>
          <p className="text-xs text-slate-500">Gere e visualize relatórios homologados para prestação de contas na SME Crateús</p>
        </div>

        <div className="flex flex-wrap items-end gap-3.5">
          {/* Select Report Type */}
          <div className="flex flex-col min-w-[220px]">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Tipo de Relatório</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              id="select-report-type"
            >
              <option value="executive">Relatório Executivo (Secretária)</option>
              <option value="monthly">Relatório Mensal Operacional</option>
              <option value="school">Relatório por Escola</option>
              <option value="project">Relatório por Projeto</option>
              <option value="indicators">Relatório de Indicadores & Rankings</option>
            </select>
          </div>

          {/* Sub selections */}
          {selectedReportType === 'school' && (
            <div className="flex flex-col min-w-[180px]">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Selecionar Escola</label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                id="select-report-school"
              >
                {appState.schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === 'project' && (
            <div className="flex flex-col min-w-[180px]">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Selecionar Projeto</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                id="select-report-project"
              >
                {appState.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={!!isDownloading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider"
              id="btn-export-pdf"
            >
              <Printer className="h-3.5 w-3.5" /> Impressão / PDF
            </button>
            <button
              onClick={() => handleDownload('excel')}
              disabled={!!isDownloading}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider"
              id="btn-export-excel"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel
            </button>
            <button
              onClick={() => handleDownload('word')}
              disabled={!!isDownloading}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider"
              id="btn-export-word"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" /> Word
            </button>
          </div>
        </div>
      </div>

      {isDownloading && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-blue-800 animate-pulse">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" /> Compilando dados do relatório em formato {isDownloading.toUpperCase()}... Por favor aguarde.
        </div>
      )}

      {/* --- REPORT PREVIEW CONTAINER --- */}
      <div className="bg-slate-100/60 p-4 sm:p-8 rounded-3xl border border-slate-200/50 overflow-x-auto" id="report-preview-container">
        
        <div className="bg-white min-w-[320px] max-w-[800px] mx-auto p-6 sm:p-12 shadow-md rounded-2xl border border-slate-100 print:shadow-none print:border-none print:p-0 text-slate-800 font-sans leading-relaxed text-sm">
          
          {/* ========================================================= */}
          {/* 1. RELATÓRIO EXECUTIVO (SECRETARY) */}
          {/* ========================================================= */}
          {selectedReportType === 'executive' && (
            <div className="space-y-8" id="report-executivo-view">
              {/* Cover Page Header */}
              <div className="border-b-4 border-blue-600 pb-8 text-center sm:text-left animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Coordenadoria" className="h-12 w-auto object-contain p-1 border border-slate-200 rounded-xl bg-slate-50" />
                    ) : (
                      <div className="w-10 h-10 bg-emerald-800 text-white font-black rounded-xl flex items-center justify-center text-lg">C</div>
                    )}
                    <div className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase text-left">
                      Secretaria Municipal de Educação de Crateús <br />
                      <span className="text-emerald-700 font-extrabold">{coordinatorRole}</span>
                    </div>
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-3.5 py-1 rounded-full text-xs font-mono font-bold">
                    ANO REFERÊNCIA: 2026
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
                  RELATÓRIO DE IMPACTO E GESTÃO ESTRATÉGICA
                </h1>
                <p className="text-sm font-bold text-blue-700 mt-2 uppercase tracking-wide">
                  Coordenadoria de Inovações e Culturas Digitais (CICD)
                </p>
                <div className="text-xs text-slate-500 mt-4 font-mono font-medium">
                  Destinatária: Secretária Municipal de Educação (Dilviana Márcia Penha Alves) | Período Analisado: Jan - Jul/2026
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-widest border-l-4 border-blue-600 pl-3 mb-2">
                  1. Resumo Executivo
                </h3>
                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
                  Este documento consolida as principais entregas, indicadores de conectividade e o andamento geral das ações operacionais coordenadas pelo setor de inovação tecnológica de Crateús. No primeiro semestre de 2026, sob coordenação do <strong className="text-slate-900">{coordinatorName}</strong>, a Coordenadoria alcançou um Índice Geral de Desempenho excelente, otimizando o parque de máquinas escolar e fortalecendo a cultura maker em toda a rede.
                </p>
              </div>

              {/* Indicators Table */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-widest border-l-4 border-blue-600 pl-3 mb-3">
                  2. Principais Indicadores Estratégicos
                </h3>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider font-extrabold border-b border-slate-100">
                        <th className="p-3">Indicador</th>
                        <th className="p-3 text-right">Alvo Inicial</th>
                        <th className="p-3 text-right">Realizado Atual</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-bold text-slate-850">
                          <div>Execução do Plano de Trabalho</div>
                          <div className="text-[10px] text-slate-400 font-normal">Progresso médio de todas as metas estratégicas</div>
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono">100%</td>
                        <td className="p-3 text-right font-extrabold text-blue-600 font-mono">{overallWorkPlanProgress}%</td>
                        <td className="p-3 text-right font-semibold">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${overallWorkPlanProgress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {overallWorkPlanProgress === 100 ? 'Concluído' : 'Em Andamento'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-850">
                          <div>Ações Operacionais Concluídas</div>
                          <div className="text-[10px] text-slate-400 font-normal">{completedActions} de {totalActions} ações finalizadas</div>
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono">{totalActions} ações</td>
                        <td className="p-3 text-right font-extrabold text-blue-600 font-mono">{completedActions} ações</td>
                        <td className="p-3 text-right font-semibold">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${completedActions === totalActions && totalActions > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {completedActions === totalActions && totalActions > 0 ? '100% Concluído' : `${inProgressActions} em andamento`}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-850">
                          <div>Escolas com Wi-Fi / Infraestrutura</div>
                          <div className="text-[10px] text-slate-400 font-normal">Unidades escolares com infraestrutura ativa</div>
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono">{totalSchools} escolas</td>
                        <td className="p-3 text-right font-extrabold text-blue-600 font-mono">{servedSchoolsCount} escolas</td>
                        <td className="p-3 text-right font-semibold">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${servedSchoolsCount >= totalSchools ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                            {servedSchoolsCount >= totalSchools ? 'Meta Atingida' : 'Em Expansão'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-850">
                          <div>Professores Formados em T.I.C.</div>
                          <div className="text-[10px] text-slate-400 font-normal">Docentes capacitados em cursos registrados</div>
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono">120 profs</td>
                        <td className="p-3 text-right font-extrabold text-blue-600 font-mono">{totalFormedTeachers} profs</td>
                        <td className="p-3 text-right font-semibold">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${totalFormedTeachers >= 120 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                            {totalFormedTeachers >= 120 ? 'Meta Superada' : 'Em Andamento'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-850">
                          <div>Máquinas de Informática Recuperadas</div>
                          <div className="text-[10px] text-slate-400 font-normal">Equipamentos recuperados e operacionais</div>
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono">{totalCataloged > 0 ? totalCataloged : 50} maq</td>
                        <td className="p-3 text-right font-extrabold text-blue-600 font-mono">{totalRecovered} maq</td>
                        <td className="p-3 text-right font-semibold">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {totalRecovered > 0 ? 'Atualizado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metas Alcançadas x Pendentes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/80">
                  <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Metas & Entregas Alcançadas</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      {completedGoalsList.length + appState.goals.flatMap(g => g.actions || []).filter(a => a.completionPercent === 100).length} itens
                    </span>
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-2 font-medium">
                    {completedGoalsList.length > 0 || appState.goals.some(g => (g.actions || []).some(a => a.completionPercent === 100)) ? (
                      <>
                        {completedGoalsList.map(g => (
                          <li key={`goal-c-${g.id}`} className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900 block">{g.title}</span>
                              <span className="text-[10px] text-emerald-700">Meta Estratégica Concluída</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">100%</span>
                          </li>
                        ))}
                        {appState.goals.flatMap(g => g.actions || []).filter(a => a.completionPercent === 100).map(a => (
                          <li key={`act-c-${a.id}`} className="bg-white p-2.5 rounded-xl border border-emerald-200/40 shadow-2xs flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-slate-800 block">{a.title}</span>
                              <span className="text-[10px] text-slate-400">Resp: {a.responsible}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">100%</span>
                          </li>
                        ))}
                      </>
                    ) : (
                      <li className="text-slate-400 italic text-center py-3">Nenhuma meta ou ação atingiu 100% de conclusão até o momento.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/80">
                  <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Metas Pendentes / Em Risco</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono font-bold">
                      {pendingGoalsList.length} metas em andamento
                    </span>
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-2 font-medium">
                    {pendingGoalsList.length > 0 ? (
                      pendingGoalsList.map(g => {
                        const actions = g.actions || [];
                        const avg = actions.length > 0 
                          ? Math.round(actions.reduce((acc, a) => acc + (a.completionPercent || 0), 0) / actions.length)
                          : 0;
                        return (
                          <li key={`goal-p-${g.id}`} className="bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">{g.title}</span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${avg < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                {avg}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full transition-all ${avg < 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${avg}%` }}></div>
                            </div>
                            {actions.length > 0 && (
                              <div className="text-[10px] text-slate-500 flex justify-between pt-0.5">
                                <span>{actions.filter(a => a.completionPercent === 100).length}/{actions.length} ações finalizadas</span>
                                <span>Categoria: {g.category}</span>
                              </div>
                            )}
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-slate-400 italic text-center py-3">Todas as metas estratégicas foram concluídas!</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Dificuldades, Recomendações e Próximos Passos - AI Synthesized */}
              <div className="space-y-5 pt-6 border-t border-slate-200" id="report-ai-synthesis">
                <div className="flex items-center justify-between bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                        Síntese Diagnóstica Inteligente
                      </h4>
                      <p className="text-[10px] text-slate-500">Relatório analítico gerado automaticamente a partir dos registros em tempo real da rede</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                    SÍNTESE ATUALIZADA
                  </span>
                </div>

                {/* 1. Dificuldades e Gargalos */}
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    1. Dificuldades e Gargalos Mapeados na Rede
                  </h4>
                  <div className="text-xs text-slate-700 leading-relaxed font-medium space-y-1.5 pl-4 border-l-2 border-amber-300">
                    {(() => {
                      const defectiveSchools = appState.schools.filter(s => (s.equipmentDefective || 0) > 0);
                      const lowWifiSchools = appState.schools.filter(s => s.internetQuality === 'Ruim' || s.internetQuality === 'Péssima' || !s.internetAccessPoints || s.internetAccessPoints.length === 0);
                      const pendingActionsCount = appState.goals.flatMap(g => g.actions || []).filter(a => a.completionPercent < 100).length;
                      const recentVisitsNeeds = (appState.visits || []).flatMap(v => v.mainNeeds || []);

                      return (
                        <>
                          <p>
                            • <strong>Manutenção de Equipamentos:</strong> {totalDefective > 0 ? (
                              `Identificados ${totalDefective} equipamentos com avarias ou pendentes de reparo distribuídos em ${defectiveSchools.length} escola(s) da rede municipal.`
                            ) : (
                              'O parque tecnológico apresenta excelente estado de conservação, sem acúmulo de equipamentos danificados.'
                            )}
                          </p>
                          <p>
                            • <strong>Qualidade e Alcance da Conectividade:</strong> {lowWifiSchools.length > 0 ? (
                              `Aproximadamente ${lowWifiSchools.length} unidade(s) escolar(es) necessitam de ampliação da infraestrutura de Wi-Fi ou upgrade da banda de internet contratada.`
                            ) : (
                              'Todas as escolas cadastradas contam com links de internet estabilizados e cobertura Wi-Fi ativa.'
                            )}
                          </p>
                          <p>
                            • <strong>Demandas de Campo & Visitas Técnicas:</strong> {recentVisitsNeeds.length > 0 ? (
                              `Nas visitas técnicas recentemente realizadas foram mapeadas prioridades operacionais em: ${Array.from(new Set(recentVisitsNeeds)).slice(0, 3).join('; ')}.`
                            ) : (
                              `Existem ${pendingActionsCount} ação(ões) operacionais em andamento que exigem acompanhamento contínuo no cronograma de execução.`
                            )}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 2. Recomendações Estratégicas */}
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    2. Recomendações Estratégicas Prioritárias
                  </h4>
                  <div className="text-xs text-slate-700 leading-relaxed font-medium space-y-1.5 pl-4 border-l-2 border-blue-400">
                    {(() => {
                      const totalProfs = appState.formations.reduce((acc, f) => acc + (f.participantsCount || 0), 0);
                      const activeProj = appState.projects.filter(p => (p.completionPercent || 0) < 100);

                      return (
                        <>
                          <p>
                            • <strong>Plano de Manutenção Preventiva:</strong> Priorizar o remanejamento e a recuperação técnica dos {totalDefective} computadores sinalizados, otimizando recursos e reduzindo a necessidade de novas compras.
                          </p>
                          <p>
                            • <strong>Capacitação Continuada:</strong> Expandir o ciclo de formações docentes (atualmente com {totalProfs} professores atendidos em {appState.formations.length} capacitações) para garantir a plena apropriação pedagógica das tecnologias digitais.
                          </p>
                          <p>
                            • <strong>Acompanhamento de Projetos:</strong> Monitorar a execução dos {activeProj.length} projeto(s) estratégico(s) em andamento na Coordenadoria, assegurando o cumprimento dos prazos e metas orçamentárias.
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 3. Próximos Passos */}
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    3. Próximos Passos e Entregas Previstas
                  </h4>
                  <div className="text-xs text-slate-700 leading-relaxed font-medium space-y-1.5 pl-4 border-l-2 border-emerald-500">
                    {(() => {
                      const pendingActions = appState.goals.flatMap(g => g.actions || []).filter(a => a.completionPercent < 100);
                      const nextDue = pendingActions.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];

                      return (
                        <>
                          <p>
                            • Conclusão das {pendingActions.length} ações operacionais em andamento no Plano de Trabalho da Coordenadoria de Inovação.
                          </p>
                          {nextDue && (
                            <p>
                              • Entrega prioritária iminente: <strong>{nextDue.title}</strong> (Responsável: {nextDue.responsible}, Prazo: {nextDue.dueDate}).
                            </p>
                          )}
                          <p>
                            • Consolidação do relatório de feiras de ciências escolares ({appState.fairs.length} evento(s) cadastrado(s) com {appState.fairs.reduce((acc, f) => acc + (f.projectsCount || 0), 0)} projetos apresentados) e homologação final dos resultados da rede.
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-12 flex flex-col sm:flex-row justify-between items-center text-center gap-6">
                <div>
                  <div className="h-0.5 w-52 bg-slate-250 mx-auto mb-1"></div>
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{coordinatorName}</div>
                  <div className="text-[9px] text-slate-500">{coordinatorRole}</div>
                </div>
                <div>
                  <div className="h-0.5 w-52 bg-slate-250 mx-auto mb-1"></div>
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Dilviana Márcia Penha Alves</div>
                  <div className="text-[9px] text-slate-500">Secretária Municipal de Educação - SME Crateús</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. RELATÓRIO MENSAL OPERACIONAL */}
          {/* ========================================================= */}
          {selectedReportType === 'monthly' && (
            <div className="space-y-6 animate-fade-in" id="report-mensal-view">
              <div className="border-b-2 border-blue-600 pb-4">
                <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Boletim Mensal Consolidado</div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight">Relatório Mensal de Atividades</h1>
                <p className="text-xs text-slate-500 mt-0.5">Período de Referência: Julho de 2026 | Gerado Automaticamente</p>
              </div>

              {/* Realized activities */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider mb-2">Atividades Realizadas e Acompanhadas</h4>
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-1.5 font-bold text-slate-600">
                    <span>Ações em andamento / concluídas</span>
                    <span className="font-mono font-extrabold text-blue-700">{appState.goals.reduce((acc, g) => acc + g.actions.filter(a => a.completionPercent > 0).length, 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-1.5 font-bold text-slate-600">
                    <span>Vistorias e visitas técnicas realizadas</span>
                    <span className="font-mono font-extrabold text-blue-700">{appState.visits.filter(v => v.status === 'realizada').length}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-100 pb-1.5 font-bold text-slate-600">
                    <span>Formações docentes concluídas</span>
                    <span className="font-mono font-extrabold text-blue-700">{appState.formations.filter(f => f.status === 'realizada').length}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Feiras de Ciências escolares homologadas</span>
                    <span className="font-mono font-extrabold text-blue-700">{appState.fairs.filter(fr => fr.status === 'realizada').length}</span>
                  </div>
                </div>
              </div>

              {/* Equipment indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="text-[9px] font-extrabold text-blue-700 uppercase tracking-wider">Catalogados</div>
                  <div className="text-2xl font-bold font-mono text-blue-900 mt-1">{totalCataloged}</div>
                  <p className="text-[10px] text-blue-550 font-medium">Inventório total</p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider">Recuperados</div>
                  <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">{totalRecovered}</div>
                  <p className="text-[10px] text-emerald-550 font-medium">Parque de máquinas</p>
                </div>
                <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                  <div className="text-[9px] font-extrabold text-red-700 uppercase tracking-wider">Com Defeito</div>
                  <div className="text-2xl font-bold font-mono text-red-900 mt-1">{totalDefective}</div>
                  <p className="text-[10px] text-red-550 font-medium">Aguardando reparo</p>
                </div>
              </div>

              {/* Internet quality and observations */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider mb-2">Conectividade e Qualidade da Internet</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  A velocidade de internet média aferida nas escolas de Crateús é de <strong className="text-slate-900">44 Mbps</strong>. Do total de escolas acompanhadas, 62% contam com links de excelente estabilidade. Foi detectado rompimento de fibra externa que causou queda temporária na escola Francisco de Assis, já com chamado técnico aberto perante a provedora licitada.
                </p>
              </div>

              {/* Photo placeholder simulated section */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider mb-2">Evidências e Registros de Campo</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] font-bold border border-slate-100 uppercase tracking-wider text-center p-2">
                    Lab Maria de Lourdes
                  </div>
                  <div className="h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] font-bold border border-slate-100 uppercase tracking-wider text-center p-2">
                    Oficina Workspace
                  </div>
                  <div className="h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] font-bold border border-slate-100 uppercase tracking-wider text-center p-2">
                    Montagem Robótica
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. RELATÓRIO POR ESCOLA */}
          {/* ========================================================= */}
          {selectedReportType === 'school' && !selectedSchool && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-bold text-amber-800">Nenhuma escola cadastrada na plataforma</p>
              <p className="text-xs text-amber-600 max-w-md mx-auto">Para gerar um Dossiê Técnico ou relatório individual por escola, realize o cadastro no módulo "Gerenciar Escolas".</p>
            </div>
          )}

          {selectedReportType === 'school' && selectedSchool && (
            <div className="space-y-6 animate-fade-in" id="report-escola-view">
              <div className="border-b-2 border-blue-600 pb-4">
                <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Dossiê Técnico de Unidade de Ensino</div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight">{selectedSchool.name}</h1>
                <p className="text-xs text-slate-500 mt-0.5">Bairro: {selectedSchool.neighborhood} | Histórico Atualizado</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-955 uppercase tracking-wider mb-2">Informações Cadastrais</h4>
                  <div className="space-y-1.5 text-xs text-slate-650 font-medium">
                    <p>Código INEP: <strong className="text-slate-800 font-mono">{selectedSchool.inep || 'Não cadastrado'}</strong></p>
                    <p>Diretor(es): <strong className="text-slate-800">{selectedSchool.directors || 'Não informado'}</strong></p>
                    <p>Coordenador(es): <strong className="text-slate-800">{selectedSchool.coordinators || 'Não informado'}</strong></p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {selectedSchool.servesInfant && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-100">Infantil</span>
                      )}
                      {selectedSchool.servesElementary1 && (
                        <span className="text-[9px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-100">Fund. Iniciais</span>
                      )}
                      {selectedSchool.servesElementary2 && (
                        <span className="text-[9px] bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded border border-sky-100">Fund. Finais</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-955 uppercase tracking-wider mb-2">Conectividade e Internet</h4>
                  <div className="space-y-1.5 text-xs text-slate-650 font-medium">
                    <p>Qualidade/Estabilidade: <strong className="text-slate-800">{selectedSchool.internetQuality}</strong></p>
                    <p>Velocidade Contratada: <strong className="text-slate-800 font-mono">{selectedSchool.internetSpeedMbps} Mbps</strong></p>
                    <p>Empresa / Provedora: <strong className="text-slate-800">{selectedSchool.internetProvider || 'Não informada'}</strong></p>
                    {selectedSchool.internetAccessPoints && selectedSchool.internetAccessPoints.length > 0 && (
                      <div className="mt-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Pontos de Acesso:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedSchool.internetAccessPoints.map((ap, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium border border-slate-200/50">{ap}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-extrabold text-xs text-slate-955 uppercase tracking-wider mb-2">Inventário e Equipamentos</h4>
                  <div className="space-y-1.5 text-xs text-slate-650 font-medium">
                    <p>Computadores de Mesa: <strong className="text-slate-800 font-mono">{selectedSchool.desktopQty || 0} ({selectedSchool.desktopWorkingQty || 0} ok)</strong></p>
                    <p>Notebooks / Laptops: <strong className="text-slate-800 font-mono">{selectedSchool.notebookQty || 0} ({selectedSchool.notebookWorkingQty || 0} ok)</strong></p>
                    <p>Tablets Escolares: <strong className="text-slate-800 font-mono">{selectedSchool.tabletQty || 0} ({selectedSchool.tabletWorkingQty || 0} ok)</strong></p>
                    <div className="mt-2 text-[10px] text-slate-450 font-semibold italic">
                      Total: {selectedSchool.equipmentCataloged} catalogados / {selectedSchool.equipmentRecovered} operacionais.
                    </div>
                  </div>
                </div>
              </div>

              {/* Needs & Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-955 uppercase tracking-wider mb-2">Necessidades Encontradas</h4>
                  <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1.5 font-medium">
                    {selectedSchool.needs.length > 0 ? (
                      selectedSchool.needs.map((n, i) => <li key={i}>{n}</li>)
                    ) : (
                      <li>Nenhuma necessidade crítica cadastrada atualmente.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-slate-955 uppercase tracking-wider mb-2">Recomendações e Pendências</h4>
                  <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1.5 font-medium">
                    {selectedSchool.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    {selectedSchool.pendingActions.map((act, i) => (
                      <li key={i} className="text-red-600 font-semibold">
                        PENDENTE: {act}
                      </li>
                    ))}
                    {selectedSchool.pendingActions.length === 0 && selectedSchool.recommendations.length === 0 && (
                      <li>Unidade em conformidade e atualizada.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. RELATÓRIO POR PROJETO */}
          {/* ========================================================= */}
          {selectedReportType === 'project' && (!selectedProject || appState.projects.length === 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-bold text-amber-800">Nenhum projeto estratégico cadastrado na plataforma</p>
              <p className="text-xs text-amber-600 max-w-md mx-auto">Para acompanhar relatórios por projeto, cadastre um novo projeto estratégico na aba "Gerenciar -&gt; Projetos Estratégicos".</p>
            </div>
          )}

          {selectedReportType === 'project' && selectedProject && (
            <div className="space-y-6 animate-fade-in" id="report-projeto-view">
              <div className="border-b-2 border-blue-600 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Acompanhamento de Projetos de Inovação</div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight">{selectedProject.name || 'Projeto sem nome'}</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Responsável: {selectedProject.responsible || 'Não informado'}</p>
                  </div>
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo Coordenadoria" className="h-10 w-auto object-contain p-1 border border-slate-200 rounded-lg bg-slate-50 shrink-0" />
                  )}
                </div>
              </div>

              {/* Core numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Progresso Geral</span>
                  <div className="text-xl font-bold font-mono text-slate-800 mt-1">{selectedProject.completionPercent ?? 0}%</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Orçamento Alocado</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    R$ {(selectedProject.budget ?? 0).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Orçamento Consumido</span>
                  <div className="text-xl font-bold font-mono text-slate-800 mt-1">
                    R$ {(selectedProject.budgetSpent ?? 0).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Description and metadata */}
              <div className="space-y-2 text-xs text-slate-650 font-medium bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <p><strong className="text-slate-800 uppercase text-[10px]">Descrição do Projeto:</strong> <br /><span className="text-slate-700 font-normal leading-relaxed">{selectedProject.description || 'Sem descrição informada.'}</span></p>
                <p className="pt-1"><strong className="text-slate-800 uppercase text-[10px]">Cronograma de Execução:</strong> <span className="text-slate-700 font-normal">De {selectedProject.startDate || 'Não informado'} até {selectedProject.dueDate || 'Não informado'}</span></p>
                <p><strong className="text-slate-800 uppercase text-[10px]">Status Administrativo:</strong> <span className="text-emerald-700 font-extrabold uppercase ml-1">{selectedProject.status || 'ativo'}</span></p>
              </div>

              {/* Involved Schools */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider mb-2">Unidades Escolares Envolvidas</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedProject.schoolsInvolved || []).length > 0 ? (
                    (selectedProject.schoolsInvolved || []).map(schId => {
                      const sch = appState.schools.find(s => s.id === schId);
                      return (
                        <span key={schId} className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-xl font-bold border border-slate-200">
                          {sch ? sch.name : `Escola ID: ${schId}`}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400 italic">Nenhuma escola vinculada diretamente.</span>
                  )}
                </div>
              </div>

              {/* Accomplished outcomes list */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider mb-2">Resultados Obtidos e Entregas Homologadas</h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1.5 font-medium">
                  {(selectedProject.results || []).length > 0 ? (
                    (selectedProject.results || []).map((res, i) => <li key={i}>{res}</li>)
                  ) : (
                    <li>Projeto em fase inicial de planejamento. Sem entregas registradas até a data presente.</li>
                  )}
                </ul>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-center gap-6">
                <div>
                  <div className="h-0.5 w-48 bg-slate-250 mx-auto mb-1"></div>
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{selectedProject.responsible || coordinatorName}</div>
                  <div className="text-[9px] text-slate-500">Responsável pelo Projeto</div>
                </div>
                <div>
                  <div className="h-0.5 w-48 bg-slate-250 mx-auto mb-1"></div>
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{coordinatorName}</div>
                  <div className="text-[9px] text-slate-500">{coordinatorRole}</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. RELATÓRIO DE INDICADORES & RANKINGS */}
          {/* ========================================================= */}
          {selectedReportType === 'indicators' && (
            <div className="space-y-6 animate-fade-in" id="report-indicadores-view">
              <div className="border-b-2 border-blue-600 pb-4">
                <div className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Demonstrativo de Analytics Estratégico</div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-tight">Estatísticas, Rankings e Evolução</h1>
                <p className="text-xs text-slate-500 mt-0.5">Indicadores automáticos da Coordenadoria de Culturas Digitais</p>
              </div>

              {/* Ranking of schools (highest visits and equipment count) */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ListOrdered className="h-4 w-4 text-blue-600" />
                  Ranking de Escolas Atendidas
                </h4>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[9px] border-b border-slate-100">
                        <th className="p-3">Posição</th>
                        <th className="p-3">Escola Municipal</th>
                        <th className="p-3 text-center">Atendimentos</th>
                        <th className="p-3 text-right">Velocidade Internet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appState.schools
                        .slice()
                        .sort((a, b) => b.visitsCount - a.visitsCount)
                        .map((s, idx) => (
                          <tr key={s.id}>
                            <td className="p-3 font-mono text-slate-400 font-bold">#{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-800">{s.name}</td>
                            <td className="p-3 text-center text-slate-600 font-semibold">{s.visitsCount} visitas</td>
                            <td className="p-3 text-right font-mono text-blue-600 font-bold">{s.internetSpeedMbps} Mbps</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ranking of actions / goals */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-955 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-blue-600" />
                  Gargalos de Ações de Alto Impacto (Fila de Prioridade)
                </h4>
                <div className="space-y-2.5">
                  {appState.goals
                    .flatMap(g => g.actions.map(a => ({ ...a, goalTitle: g.title })))
                    .sort((a, b) => b.impactScore - a.impactScore)
                    .slice(0, 4)
                    .map((act, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <span className="font-bold text-slate-800 truncate max-w-[300px]">{act.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-slate-200 text-slate-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-slate-300/30">Impacto: {act.impactScore}/10</span>
                          <span className={`font-mono font-bold ${act.completionPercent >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{act.completionPercent}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="mt-12 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono gap-4">
            <span>PLATA-ESTRATEGICA-CRATEUS V2.10</span>
            <span>DATA DE EMISSÃO: 10/07/2026 - 13:31</span>
            <span>DOCUMENTO HOMOLOGADO</span>
          </div>

        </div>
      </div>

    </div>
  );
};
