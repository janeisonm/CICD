import React, { useState, useEffect, useRef } from 'react';
import { useStrategicState } from '../stateContext';
import { 
  Search, X, Target, CheckSquare, ListChecks, BookOpen, 
  School as SchoolIcon, Wrench, Users, Trophy, ChevronRight, 
  Sparkles, Filter, Navigation, LayoutDashboard, Clock, Award, FileText, Sliders
} from 'lucide-react';

export interface SearchResultItem {
  id: string;
  type: 'goal' | 'action' | 'microaction' | 'project' | 'school' | 'visit' | 'formation' | 'fair' | 'nav';
  typeLabel: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  targetTab: 'dashboard' | 'timeline' | 'pending' | 'achieved' | 'reports' | 'manage';
  subTab?: string;
  matchedText?: string;
}

// Accent & case insensitive search helper
function normalizeStr(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const GlobalSearch: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const { state, setActiveTab } = useStrategicState();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const normQuery = normalizeStr(query.trim());

  // Search logic across system
  const getResults = (): SearchResultItem[] => {
    if (!normQuery) return [];

    const results: SearchResultItem[] = [];

    // 0. Module Navigation Shortcuts
    const navModules = [
      { id: 'nav-dashboard', key: ['dashboard', 'painel', 'indicadores', 'executivo', 'grafico', 'resumo'], tab: 'dashboard' as const, title: 'Ir para Dashboard Executivo', label: 'Módulo Principal', iconIcon: 'dashboard' },
      { id: 'nav-timeline', key: ['linha do tempo', 'timeline', 'cronograma', 'datas', 'prazos', 'calendario'], tab: 'timeline' as const, title: 'Ir para Linha do Tempo de Entregas', label: 'Módulo de Cronograma', iconIcon: 'timeline' },
      { id: 'nav-pending', key: ['agenda', 'pendente', 'pendencias', 'o que falta fazer', 'atrasadas'], tab: 'pending' as const, title: 'Ir para Agenda "O Que Falta Fazer"', label: 'Módulo de Pendências', iconIcon: 'pending' },
      { id: 'nav-achieved', key: ['objetivos alcancados', 'concluidos', 'concluidas', 'sucesso', 'metas batidas', 'vitorias'], tab: 'achieved' as const, title: 'Ir para Painel de Objetivos Alcançados', label: 'Módulo de Conquistas', iconIcon: 'achieved' },
      { id: 'nav-reports', key: ['relatorio', 'relatorios', 'pdf', 'impressao', 'exportar', 'gerencial'], tab: 'reports' as const, title: 'Ir para Relatórios Gerenciais', label: 'Módulo de Relatórios', iconIcon: 'reports' },
      { id: 'nav-coordenadoria', key: ['coordenadoria', 'logo', 'responsavel', 'secretaria', 'reginaldo', 'identidade'], tab: 'manage' as const, subTab: 'coordenadoria', title: 'Configurar Logo e Identidade da Coordenadoria', label: 'Configurações do Sistema', iconIcon: 'manage' },
      { id: 'nav-schools', key: ['escola', 'escolas', 'rede', 'inep', 'diretor', 'coordenador'], tab: 'manage' as const, subTab: 'schools', title: 'Gerenciar Escolas da Rede Municipal', label: 'Cadastro de Escolas', iconIcon: 'school' },
      { id: 'nav-cloud-sync', key: ['drive', 'google drive', 'nuvem', 'backup', 'sincronizacao', 'sync'], tab: 'manage' as const, subTab: 'cloud-sync', title: 'Sincronização em Nuvem (Google Drive)', label: 'Backup & Cloud', iconIcon: 'manage' }
    ];

    navModules.forEach(nav => {
      const match = nav.key.some(k => normalizeStr(k).includes(normQuery) || normQuery.includes(normalizeStr(k)));
      if (match) {
        results.push({
          id: nav.id,
          type: 'nav',
          typeLabel: nav.label,
          title: nav.title,
          subtitle: `Navegação Direta no Sistema SME Crateús`,
          targetTab: nav.tab,
          subTab: nav.subTab,
          badge: 'Navegação',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        });
      }
    });

    // 1. Metas Estratégicas
    state.goals.forEach(goal => {
      const matchTitle = normalizeStr(goal.title).includes(normQuery);
      const matchCategory = normalizeStr(goal.category).includes(normQuery);
      const matchDesc = normalizeStr(goal.description).includes(normQuery);

      if (matchTitle || matchCategory || matchDesc) {
        results.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          typeLabel: 'Meta Estratégica',
          title: goal.title,
          subtitle: `Categoria: ${goal.category} • Meta: ${goal.targetValue} ${goal.unit}`,
          description: goal.description,
          badge: `${goal.currentValue}/${goal.targetValue} ${goal.unit}`,
          badgeColor: 'bg-blue-100 text-blue-800',
          targetTab: 'manage',
          subTab: 'actions'
        });
      }

      // 2. Ações Operacionais inside Goals
      goal.actions.forEach(action => {
        const matchActTitle = normalizeStr(action.title).includes(normQuery);
        const matchActResp = normalizeStr(action.responsible).includes(normQuery);
        const matchActCat = normalizeStr(action.category).includes(normQuery);
        const matchActDesc = normalizeStr(action.description || '').includes(normQuery);

        if (matchActTitle || matchActResp || matchActCat || matchActDesc) {
          results.push({
            id: `action-${action.id}`,
            type: 'action',
            typeLabel: 'Ação Operacional',
            title: action.title,
            subtitle: `Meta: ${goal.title} • Responsável: ${action.responsible}`,
            description: action.description || `Início: ${action.startDate} | Fim: ${action.dueDate}`,
            badge: `${action.completionPercent || 0}%`,
            badgeColor: action.completionPercent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
            targetTab: 'manage',
            subTab: 'actions'
          });
        }

        // 3. Microações
        const microList = action.microactionsList || (action as any).microActions || [];
        microList.forEach((micro: any) => {
          const matchMicroTitle = normalizeStr(micro.title).includes(normQuery);
          const matchMicroResp = normalizeStr(micro.responsible || '').includes(normQuery);

          if (matchMicroTitle || matchMicroResp) {
            results.push({
              id: `micro-${micro.id}`,
              type: 'microaction',
              typeLabel: 'Etapa / Microação',
              title: micro.title,
              subtitle: `Ação: ${action.title} • Resp: ${micro.responsible || action.responsible}`,
              badge: micro.completed || micro.status === 'concluido' ? 'Concluída' : 'Pendente',
              badgeColor: micro.completed || micro.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700',
              targetTab: 'manage',
              subTab: 'actions'
            });
          }
        });
      });
    });

    // 4. Projetos Estratégicos
    state.projects.forEach(project => {
      const matchName = normalizeStr(project.name).includes(normQuery);
      const matchResp = normalizeStr(project.responsible).includes(normQuery);
      const matchDesc = normalizeStr(project.description).includes(normQuery);
      const matchResults = (project.results || []).some(r => normalizeStr(r).includes(normQuery));

      if (matchName || matchResp || matchDesc || matchResults) {
        results.push({
          id: `project-${project.id}`,
          type: 'project',
          typeLabel: 'Projeto Estratégico',
          title: project.name,
          subtitle: `Responsável: ${project.responsible} • Prazo: ${project.dueDate}`,
          description: project.description,
          badge: `${project.completionPercent || 0}%`,
          badgeColor: 'bg-indigo-100 text-indigo-800',
          targetTab: 'manage',
          subTab: 'projects'
        });
      }
    });

    // 5. Escolas da Rede
    state.schools.forEach(school => {
      const matchName = normalizeStr(school.name).includes(normQuery);
      const matchInep = normalizeStr(school.inep).includes(normQuery);
      const matchNeigh = normalizeStr(school.neighborhood).includes(normQuery);
      const matchDirs = normalizeStr(school.directors).includes(normQuery);
      const matchCoords = normalizeStr(school.coordinators).includes(normQuery);
      const matchProvider = normalizeStr(school.internetProvider).includes(normQuery);
      const matchInfra = normalizeStr(school.infrastructureLevel).includes(normQuery);
      const matchPoints = (school.internetAccessPoints || []).some(p => normalizeStr(p).includes(normQuery));
      const matchNeeds = (school.needs || []).some(n => normalizeStr(n).includes(normQuery));

      if (matchName || matchInep || matchNeigh || matchDirs || matchCoords || matchProvider || matchInfra || matchPoints || matchNeeds) {
        results.push({
          id: `school-${school.id}`,
          type: 'school',
          typeLabel: 'Escola Municipal',
          title: school.name,
          subtitle: `INEP: ${school.inep || 'N/I'} • Direção: ${school.directors || 'Não inf.'} • ${school.neighborhood || ''}`,
          description: `Provedor: ${school.internetProvider || 'N/I'} | ${school.totalStudents || 0} Alunos | ${school.internetAccessPoints?.length || 0} Pts Wi-Fi`,
          badge: school.internetQuality || 'Cadastrada',
          badgeColor: 'bg-sky-100 text-sky-800',
          targetTab: 'manage',
          subTab: 'schools'
        });
      }
    });

    // 6. Visitas Técnicas
    (state.visits || []).forEach(visit => {
      const matchSchool = normalizeStr(visit.schoolName).includes(normQuery);
      const matchResp = normalizeStr(visit.responsible).includes(normQuery);
      const matchDetails = normalizeStr(visit.details).includes(normQuery);
      const matchNeeds = (visit.mainNeeds || []).some(n => normalizeStr(n).includes(normQuery));

      if (matchSchool || matchResp || matchDetails || matchNeeds) {
        results.push({
          id: `visit-${visit.id}`,
          type: 'visit',
          typeLabel: 'Visita Técnica',
          title: `Visita a ${visit.schoolName}`,
          subtitle: `Técnico: ${visit.responsible} • Data: ${visit.date}`,
          description: `${visit.details} ${visit.internetSpeed ? `| Velocidade: ${visit.internetSpeed} Mbps` : ''}`,
          badge: `${visit.internetSpeed || 0} Mbps`,
          badgeColor: 'bg-teal-100 text-teal-800',
          targetTab: 'manage',
          subTab: 'visits'
        });
      }
    });

    // 7. Capacitações Docentes
    (state.formations || []).forEach(formation => {
      const matchTitle = normalizeStr(formation.title).includes(normQuery);
      const matchTheme = normalizeStr(formation.theme).includes(normQuery);
      const matchAudience = normalizeStr(formation.audience).includes(normQuery);

      if (matchTitle || matchTheme || matchAudience) {
        results.push({
          id: `formation-${formation.id}`,
          type: 'formation',
          typeLabel: 'Capacitação Docente',
          title: formation.title,
          subtitle: `Tema: ${formation.theme} • Público: ${formation.audience}`,
          description: `Data: ${formation.date} | Participantes: ${formation.participantsCount} docentes | Carga Horária: ${formation.hours}h`,
          badge: `${formation.participantsCount} profs`,
          badgeColor: 'bg-purple-100 text-purple-800',
          targetTab: 'manage',
          subTab: 'formations'
        });
      }
    });

    // 8. Feiras de Ciências
    (state.fairs || []).forEach(fair => {
      const matchName = normalizeStr(fair.name).includes(normQuery);
      const matchSchool = normalizeStr(fair.schoolName || '').includes(normQuery);

      if (matchName || matchSchool) {
        results.push({
          id: `fair-${fair.id}`,
          type: 'fair',
          typeLabel: 'Feira de Ciências',
          title: fair.name,
          subtitle: `Sede: ${fair.schoolName || 'Escola de Crateús'} • Data: ${fair.date}`,
          badge: `${fair.projectsCount} Projetos`,
          badgeColor: 'bg-amber-100 text-amber-800',
          targetTab: 'manage',
          subTab: 'fairs'
        });
      }
    });

    return results;
  };

  const allResults = getResults();

  const filteredResults = allResults.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'goals' && (r.type === 'goal' || r.type === 'action' || r.type === 'microaction')) return true;
    if (activeFilter === 'projects' && r.type === 'project') return true;
    if (activeFilter === 'schools' && r.type === 'school') return true;
    if (activeFilter === 'visits' && r.type === 'visit') return true;
    if (activeFilter === 'formations' && r.type === 'formation') return true;
    if (activeFilter === 'fairs' && r.type === 'fair') return true;
    return false;
  });

  const handleSelectResult = (item: SearchResultItem) => {
    setActiveTab(item.targetTab, item.subTab);
    setIsOpen(false);
  };

  // Keyboard navigation inside search input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'nav': return <Navigation className="h-4 w-4 text-emerald-600" />;
      case 'goal': return <Target className="h-4 w-4 text-blue-600" />;
      case 'action': return <CheckSquare className="h-4 w-4 text-emerald-600" />;
      case 'microaction': return <ListChecks className="h-4 w-4 text-indigo-600" />;
      case 'project': return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'school': return <SchoolIcon className="h-4 w-4 text-sky-600" />;
      case 'visit': return <Wrench className="h-4 w-4 text-teal-600" />;
      case 'formation': return <Users className="h-4 w-4 text-violet-600" />;
      case 'fair': return <Trophy className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <>
      {/* SEARCH TRIGGER BUTTON */}
      {isMobile ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-emerald-200 hover:text-white bg-emerald-900/60 hover:bg-emerald-800 rounded-xl border border-emerald-800/60 flex items-center gap-2 cursor-pointer text-xs transition-colors"
          title="Pesquisar no sistema"
        >
          <Search className="h-4 w-4 text-emerald-400" />
          <span className="hidden sm:inline text-[11px] font-medium text-emerald-300">Pesquisar...</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-emerald-900/50 hover:bg-emerald-900/80 text-emerald-200 hover:text-white border border-emerald-700/60 px-3.5 py-2 rounded-2xl shadow-inner transition-all cursor-pointer text-xs w-56 lg:w-72 group backdrop-blur-xs"
          id="global-search-trigger"
        >
          <Search className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 transition-colors shrink-0" />
          <span className="font-medium text-emerald-200 text-left flex-1 truncate">
            Pesquisar no sistema...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold bg-emerald-800/80 text-emerald-300 border border-emerald-600/50 px-1.5 py-0.5 rounded-md shrink-0">
            Ctrl K
          </kbd>
        </button>
      )}

      {/* SEARCH OVERLAY / MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <Search className="h-5 w-5 text-emerald-600 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Busque por escolas, metas, ações, projetos, visitas, formações, feiras..."
                className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-200/60 hover:bg-slate-200 rounded-xl cursor-pointer text-xs font-bold shrink-0 ml-1"
              >
                ESC
              </button>
            </div>

            {/* Category Filter Tabs */}
            {normQuery && (
              <div className="flex items-center gap-1.5 p-3 px-4 border-b border-slate-100 bg-white overflow-x-auto text-[11px] font-bold text-slate-600 scrollbar-none shrink-0">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
                  <Filter className="h-3 w-3" /> Filtrar:
                </span>
                {[
                  { id: 'all', label: `Todos (${allResults.length})` },
                  { id: 'goals', label: 'Metas & Ações' },
                  { id: 'projects', label: 'Projetos' },
                  { id: 'schools', label: 'Escolas' },
                  { id: 'visits', label: 'Visitas' },
                  { id: 'formations', label: 'Capacitações' },
                  { id: 'fairs', label: 'Feiras' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Search Results List */}
            <div ref={resultsContainerRef} className="overflow-y-auto p-3 space-y-2 flex-1">
              {!normQuery ? (
                <div className="py-12 px-6 text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-700">Busca Global - Sistema SME Crateús</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Digite qualquer palavra ou termo para buscar simultaneamente em Escolas, Metas Estratégicas, Ações, Projetos, Visitas Técnicas, Formações e Feiras de Ciências.
                    </p>
                  </div>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="py-12 px-6 text-center text-slate-400 space-y-2">
                  <p className="font-extrabold text-sm text-slate-700">Nenhum resultado encontrado</p>
                  <p className="text-xs text-slate-400">
                    Não encontramos correspondências para "<span className="text-slate-800 font-bold">{query}</span>". Tente utilizar outros termos.
                  </p>
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3.5 shadow-2xs ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20' 
                          : 'border-slate-100 hover:border-emerald-200 bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="p-2 bg-slate-50 group-hover:bg-white rounded-xl border border-slate-100 shrink-0 mt-0.5">
                        {getTypeIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            {item.typeLabel}
                          </span>
                          {item.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {item.title}
                        </h4>

                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {item.subtitle}
                          </p>
                        )}

                        {item.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="self-center shrink-0 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer status bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
              <span>{allResults.length} resultado(s) encontrado(s)</span>
              <span className="flex items-center gap-1">
                Pressione <kbd className="bg-white border border-slate-200 px-1 rounded text-slate-600 font-mono font-bold">↵ Enter</kbd> para abrir o item
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
