import React, { useState, useEffect } from 'react';
import { useStrategicState } from '../stateContext';
import { SchoolExcelUpload } from './SchoolExcelUpload';
import { UserManagementSubTab } from './UserManagementSubTab';
import { WorkPlanGoal, Project, TechnicalVisit, Formation, ScienceFair } from '../types';
import { 
  CheckSquare, ListPlus, PlusCircle, RefreshCw, Sliders, Sparkles, Trophy, 
  Users, Wrench, School as SchoolIcon, Edit2, Trash2, Globe, Wifi, Check, Plus, 
  BookOpen, Network, ShieldCheck, Cloud, CloudUpload, CloudDownload, Database, Zap,
  AlertTriangle, X, ChevronDown, ChevronUp, Calendar, User as UserIcon, Tag, Activity, ListTodo, CheckCircle2, Circle, Clock, Target, Eye,
  Building2, Image, UserCheck, Github, FileDown, FileUp, KeyRound, ExternalLink, Info
} from 'lucide-react';

type SubTabType = 'actions' | 'projects' | 'visits' | 'formations' | 'fairs' | 'new-goal' | 'schools' | 'users' | 'coordenadoria' | 'cloud-sync';

export const ManageTab: React.FC = () => {
  const { 
    state, 
    updateSystemSettings,
    addTechnicalVisit, 
    updateTechnicalVisit,
    deleteTechnicalVisit,
    updateActionCompletion, 
    addAction,
    updateAction,
    deleteAction,
    addMicroaction,
    toggleMicroaction,
    deleteMicroaction,
    addFormation, 
    updateFormation,
    deleteFormation,
    addScienceFair, 
    updateScienceFair,
    deleteScienceFair,
    addGoal, 
    updateGoal,
    deleteGoal,
    addProject,
    updateProject,
    deleteProject,
    resetData,
    addSchool,
    deleteSchool,
    deleteAllSchools,
    updateSchool,
    currentUser,
    updateUserProfile,
    user,
    isDriveConnected,
    isSyncingDrive,
    lastDriveSync,
    autoSyncEnabled,
    setAutoSyncEnabled,
    connectToDrive,
    disconnectFromDrive,
    saveToDriveNow,
    loadFromDriveNow,
    isSyncingGitHub,
    updateGitHubConfig,
    syncWithGitHubNow,
    loadFromGitHubNow,
    exportLocalJson,
    importLocalJson
  } = useStrategicState();

  const [activeSubTab, setActiveSubTab] = useState<SubTabType>((state.activeSubTab as SubTabType) || 'actions');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // GitHub subtab state
  const [ghRepoInput, setGhRepoInput] = useState(state.githubConfig?.repo || '');
  const [ghTokenInput, setGhTokenInput] = useState(state.githubConfig?.token || '');
  const [ghBranchInput, setGhBranchInput] = useState(state.githubConfig?.branch || 'main');
  const [ghAutoSyncInput, setGhAutoSyncInput] = useState(state.githubConfig?.autoSync || false);

  useEffect(() => {
    if (state.githubConfig) {
      setGhRepoInput(state.githubConfig.repo || '');
      setGhTokenInput(state.githubConfig.token || '');
      setGhBranchInput(state.githubConfig.branch || 'main');
      setGhAutoSyncInput(state.githubConfig.autoSync || false);
    }
  }, [state.githubConfig]);

  useEffect(() => {
    if (state.activeSubTab) {
      setActiveSubTab(state.activeSubTab as SubTabType);
    }
  }, [state.activeSubTab]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // --- SUB TAB: COORDENADORIA & LOGO STATE ---
  const [logoUrlInput, setLogoUrlInput] = useState(state.systemSettings?.logoUrl || '');
  const [coordNameInput, setCoordNameInput] = useState(currentUser?.name || state.systemSettings?.coordinatorName || 'Prof. Francisco Reginaldo');
  const [coordRoleInput, setCoordRoleInput] = useState(currentUser?.roleTitle || state.systemSettings?.coordinatorRole || 'Coordenador de Inovação e Culturas Digitais');

  useEffect(() => {
    if (state.systemSettings) {
      setLogoUrlInput(state.systemSettings.logoUrl || '');
      setCoordNameInput(currentUser?.name || state.systemSettings.coordinatorName || 'Prof. Francisco Reginaldo');
      setCoordRoleInput(currentUser?.roleTitle || state.systemSettings.coordinatorRole || 'Coordenador de Inovação e Culturas Digitais');
    }
  }, [state.systemSettings, currentUser]);

  const handleSaveCoordenadoria = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      logoUrl: logoUrlInput,
      coordinatorName: coordNameInput,
      coordinatorRole: coordRoleInput
    });

    if (currentUser) {
      updateUserProfile(currentUser.id, coordNameInput, coordRoleInput);
    }

    triggerSuccess('Identidade, Logo e Responsável da Coordenadoria atualizados e salvos com sucesso!');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Por favor, selecione uma imagem menor que 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrlInput(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SUB TAB 6: SCHOOL CRUD STATE ---
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [schoolInep, setSchoolInep] = useState('');
  const [schoolNeighborhood, setSchoolNeighborhood] = useState('');
  const [schoolServesInfant, setSchoolServesInfant] = useState(false);
  const [schoolServesElem1, setSchoolServesElem1] = useState(false);
  const [schoolServesElem2, setSchoolServesElem2] = useState(false);
  const [schoolDirectors, setSchoolDirectors] = useState('');
  const [schoolCoordinators, setSchoolCoordinators] = useState('');
  const [schoolDesktopQty, setSchoolDesktopQty] = useState<number>(0);
  const [schoolDesktopWorking, setSchoolDesktopWorking] = useState<number>(0);
  const [schoolNotebookQty, setSchoolNotebookQty] = useState<number>(0);
  const [schoolNotebookWorking, setSchoolNotebookWorking] = useState<number>(0);
  const [schoolTabletQty, setSchoolTabletQty] = useState<number>(0);
  const [schoolTabletWorking, setSchoolTabletWorking] = useState<number>(0);
  const [schoolInternetSpeed, setSchoolInternetSpeed] = useState<number>(0);
  const [schoolInternetProvider, setSchoolInternetProvider] = useState('');
  const [newAccessPoint, setNewAccessPoint] = useState('');
  const [schoolAccessPoints, setSchoolAccessPoints] = useState<string[]>([]);
  const [schoolInfraLevel, setSchoolInfraLevel] = useState<'Insuficiente' | 'Aceitável' | 'Bom' | 'Excelente'>('Bom');
  const [schoolInternetQuality, setSchoolInternetQuality] = useState<'Sem Conexão' | 'Ruim' | 'Instável' | 'Boa' | 'Excelente'>('Boa');
  const [schoolTotalStudents, setSchoolTotalStudents] = useState<number>(0);
  const [schoolReportedDate, setSchoolReportedDate] = useState<string>(new Date().toLocaleDateString('pt-BR'));

  const [showConfirmDeleteAllModal, setShowConfirmDeleteAllModal] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !schoolInep) {
      alert('Por favor, informe o Nome da Escola e o código INEP.');
      return;
    }

    const equipmentCataloged = Number(schoolDesktopQty) + Number(schoolNotebookQty) + Number(schoolTabletQty);
    const equipmentRecovered = Number(schoolDesktopWorking) + Number(schoolNotebookWorking) + Number(schoolTabletWorking);
    const equipmentDefective = Math.max(0, equipmentCataloged - equipmentRecovered);

    const schoolData = {
      name: schoolName,
      inep: schoolInep,
      neighborhood: schoolNeighborhood || 'Centro',
      infrastructureLevel: schoolInfraLevel,
      internetQuality: schoolInternetQuality,
      internetSpeedMbps: Number(schoolInternetSpeed),
      equipmentCataloged,
      equipmentRecovered,
      equipmentDefective,
      visitsCount: editingSchoolId ? (state.schools.find(s => s.id === editingSchoolId)?.visitsCount || 0) : 0,
      lastVisitDate: editingSchoolId ? state.schools.find(s => s.id === editingSchoolId)?.lastVisitDate : undefined,
      needs: editingSchoolId ? (state.schools.find(s => s.id === editingSchoolId)?.needs || []) : [],
      recommendations: editingSchoolId ? (state.schools.find(s => s.id === editingSchoolId)?.recommendations || []) : [],
      pendingActions: editingSchoolId ? (state.schools.find(s => s.id === editingSchoolId)?.pendingActions || []) : [],
      status: editingSchoolId ? (state.schools.find(s => s.id === editingSchoolId)?.status || 'pendente') : 'pendente',
      
      servesInfant: schoolServesInfant,
      servesElementary1: schoolServesElem1,
      servesElementary2: schoolServesElem2,
      directors: schoolDirectors,
      coordinators: schoolCoordinators,
      desktopQty: Number(schoolDesktopQty),
      desktopWorkingQty: Number(schoolDesktopWorking),
      notebookQty: Number(schoolNotebookQty),
      notebookWorkingQty: Number(schoolNotebookWorking),
      tabletQty: Number(schoolTabletQty),
      tabletWorkingQty: Number(schoolTabletWorking),
      internetProvider: schoolInternetProvider,
      internetAccessPoints: schoolAccessPoints,
      totalStudents: Number(schoolTotalStudents) || 0,
      reportedDate: schoolReportedDate
    };

    if (editingSchoolId) {
      updateSchool({ ...schoolData, id: editingSchoolId });
      triggerSuccess(`Escola "${schoolName}" atualizada com sucesso!`);
    } else {
      const newId = `s_${Date.now()}`;
      addSchool({ ...schoolData, id: newId });
      triggerSuccess(`Escola "${schoolName}" cadastrada com sucesso!`);
    }

    resetSchoolForm();
  };

  const resetSchoolForm = () => {
    setEditingSchoolId(null);
    setSchoolName('');
    setSchoolInep('');
    setSchoolNeighborhood('');
    setSchoolServesInfant(false);
    setSchoolServesElem1(false);
    setSchoolServesElem2(false);
    setSchoolDirectors('');
    setSchoolCoordinators('');
    setSchoolDesktopQty(0);
    setSchoolDesktopWorking(0);
    setSchoolNotebookQty(0);
    setSchoolNotebookWorking(0);
    setSchoolTabletQty(0);
    setSchoolTabletWorking(0);
    setSchoolInternetSpeed(0);
    setSchoolInternetProvider('');
    setSchoolAccessPoints([]);
    setNewAccessPoint('');
    setSchoolInfraLevel('Bom');
    setSchoolInternetQuality('Boa');
    setSchoolTotalStudents(0);
    setSchoolReportedDate(new Date().toLocaleDateString('pt-BR'));
  };

  const handleEditSchool = (school: any) => {
    setEditingSchoolId(school.id);
    setSchoolName(school.name);
    setSchoolInep(school.inep || '');
    setSchoolNeighborhood(school.neighborhood);
    setSchoolServesInfant(!!school.servesInfant);
    setSchoolServesElem1(!!school.servesElementary1);
    setSchoolServesElem2(!!school.servesElementary2);
    setSchoolDirectors(school.directors || '');
    setSchoolCoordinators(school.coordinators || '');
    setSchoolDesktopQty(school.desktopQty || 0);
    setSchoolDesktopWorking(school.desktopWorkingQty || 0);
    setSchoolNotebookQty(school.notebookQty || 0);
    setSchoolNotebookWorking(school.notebookWorkingQty || 0);
    setSchoolTabletQty(school.tabletQty || 0);
    setSchoolTabletWorking(school.tabletWorkingQty || 0);
    setSchoolInternetSpeed(school.internetSpeedMbps);
    setSchoolInternetProvider(school.internetProvider || '');
    setSchoolAccessPoints(school.internetAccessPoints || []);
    setSchoolInfraLevel(school.infrastructureLevel);
    setSchoolInternetQuality(school.internetQuality);
    setSchoolTotalStudents(school.totalStudents || 0);
    setSchoolReportedDate(school.reportedDate || new Date().toLocaleDateString('pt-BR'));
  };

  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    setSchoolToDelete({ id: schoolId, name: schoolName });
  };

  const confirmDeleteSchoolAction = () => {
    if (schoolToDelete) {
      deleteSchool(schoolToDelete.id);
      triggerSuccess(`Escola "${schoolToDelete.name}" removida com sucesso!`);
      if (editingSchoolId === schoolToDelete.id) {
        resetSchoolForm();
      }
      setSchoolToDelete(null);
    }
  };

  const handleDeleteAllSchools = () => {
    setShowConfirmDeleteAllModal(true);
  };

  const confirmDeleteAllSchoolsAction = () => {
    deleteAllSchools();
    triggerSuccess('Todas as escolas cadastradas foram removidas com sucesso!');
    resetSchoolForm();
    setShowConfirmDeleteAllModal(false);
  };

  const confirmResetAction = () => {
    resetData();
    triggerSuccess('Os dados padrão da Coordenadoria foram restaurados com sucesso.');
    setShowConfirmResetModal(false);
  };

  const handleAddAccessPoint = () => {
    if (newAccessPoint.trim() && !schoolAccessPoints.includes(newAccessPoint.trim())) {
      setSchoolAccessPoints([...schoolAccessPoints, newAccessPoint.trim()]);
      setNewAccessPoint('');
    }
  };

  const handleRemoveAccessPoint = (point: string) => {
    setSchoolAccessPoints(schoolAccessPoints.filter(p => p !== point));
  };

  // --- SUB TAB 1: ACTIONS & GOALS MANAGEMENT ---
  const [selectedGoalId, setSelectedGoalId] = useState<string>(state.goals[0]?.id || '');
  const selectedGoal = state.goals.find(g => g.id === selectedGoalId) || state.goals[0];

  // Goal Editing & Deleting
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalCategory, setEditGoalCategory] = useState('');
  const [editGoalTarget, setEditGoalTarget] = useState<number>(0);
  const [editGoalUnit, setEditGoalUnit] = useState('');
  const [editGoalDueDate, setEditGoalDueDate] = useState('');
  const [editGoalDesc, setEditGoalDesc] = useState('');
  const [editGoalStatus, setEditGoalStatus] = useState<WorkPlanGoal['status']>('em_andamento');
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);

  const handleOpenEditGoal = () => {
    if (!selectedGoal) return;
    setEditGoalTitle(selectedGoal.title);
    setEditGoalCategory(selectedGoal.category);
    setEditGoalTarget(selectedGoal.targetValue);
    setEditGoalUnit(selectedGoal.unit);
    setEditGoalDueDate(selectedGoal.dueDate);
    setEditGoalDesc(selectedGoal.description);
    setEditGoalStatus(selectedGoal.status);
    setShowEditGoalModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    updateGoal(selectedGoal.id, {
      title: editGoalTitle.trim(),
      category: editGoalCategory,
      targetValue: Number(editGoalTarget),
      unit: editGoalUnit.trim(),
      dueDate: editGoalDueDate,
      description: editGoalDesc.trim(),
      status: editGoalStatus
    });
    setShowEditGoalModal(false);
    triggerSuccess(`Objetivo Estratégico "${editGoalTitle}" atualizado com sucesso!`);
  };

  const handleConfirmDeleteGoal = () => {
    if (!selectedGoal) return;
    const deletedTitle = selectedGoal.title;
    deleteGoal(selectedGoal.id);
    setShowDeleteGoalModal(false);
    const remaining = state.goals.filter(g => g.id !== selectedGoal.id);
    if (remaining.length > 0) {
      setSelectedGoalId(remaining[0].id);
    }
    triggerSuccess(`Objetivo "${deletedTitle}" e todas as suas ações foram removidos.`);
  };

  const [showAddActionForm, setShowAddActionForm] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionCategory, setNewActionCategory] = useState('Infraestrutura');
  const [newActionResponsible, setNewActionResponsible] = useState('Técnico Reginaldo');
  const [newActionStartDate, setNewActionStartDate] = useState('2026-07-01');
  const [newActionDueDate, setNewActionDueDate] = useState('2026-12-31');
  const [newActionImpact, setNewActionImpact] = useState<number>(8);
  const [newActionMicroInput, setNewActionMicroInput] = useState('');
  const [newActionMicroList, setNewActionMicroList] = useState<string[]>([]);

  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editActionTitle, setEditActionTitle] = useState('');
  const [editActionCategory, setEditActionCategory] = useState('');
  const [editActionResponsible, setEditActionResponsible] = useState('');
  const [editActionStartDate, setEditActionStartDate] = useState('');
  const [editActionDueDate, setEditActionDueDate] = useState('');
  const [editActionImpact, setEditActionImpact] = useState<number>(8);

  const [actionToDelete, setActionToDelete] = useState<{ goalId: string; id: string; title: string } | null>(null);
  const [expandedActionIds, setExpandedActionIds] = useState<string[]>([]);
  const [newMicroTitleMap, setNewMicroTitleMap] = useState<{ [key: string]: string }>({});

  const toggleExpandAction = (id: string) => {
    setExpandedActionIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleAddMicroToNewAction = () => {
    if (!newActionMicroInput.trim()) return;
    setNewActionMicroList(prev => [...prev, newActionMicroInput.trim()]);
    setNewActionMicroInput('');
  };

  const handleRemoveMicroFromNewAction = (index: number) => {
    setNewActionMicroList(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim() || !selectedGoal) {
      alert('Por favor, informe o título da ação.');
      return;
    }
    const microactionsList = newActionMicroList.map((title, idx) => ({
      id: `m_new_${Date.now()}_${idx}`,
      title,
      completed: false
    }));
    addAction(selectedGoal.id, {
      goalId: selectedGoal.id,
      title: newActionTitle.trim(),
      category: newActionCategory,
      responsible: newActionResponsible || 'Equipe Técnica',
      startDate: newActionStartDate,
      dueDate: newActionDueDate,
      impactScore: Number(newActionImpact),
      completionPercent: 0,
      status: 'nao_iniciado',
      microactionsCount: Math.max(microactionsList.length, 1),
      microactionsCompleted: 0,
      microactionsList: microactionsList.length > 0 ? microactionsList : undefined
    });
    setNewActionTitle('');
    setNewActionMicroList([]);
    setNewActionMicroInput('');
    setShowAddActionForm(false);
    triggerSuccess('Nova ação cadastrada com sucesso no plano!');
  };

  const handleStartEditAction = (act: any) => {
    setEditingActionId(act.id);
    setEditActionTitle(act.title);
    setEditActionCategory(act.category);
    setEditActionResponsible(act.responsible);
    setEditActionStartDate(act.startDate);
    setEditActionDueDate(act.dueDate);
    setEditActionImpact(act.impactScore || 8);
  };

  const handleSaveEditAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActionId || !selectedGoal) return;
    updateAction(selectedGoal.id, editingActionId, {
      title: editActionTitle.trim(),
      category: editActionCategory,
      responsible: editActionResponsible,
      startDate: editActionStartDate,
      dueDate: editActionDueDate,
      impactScore: Number(editActionImpact)
    });
    setEditingActionId(null);
    triggerSuccess('Ação operacional atualizada com sucesso!');
  };

  const handleConfirmDeleteAction = () => {
    if (!actionToDelete) return;
    deleteAction(actionToDelete.goalId, actionToDelete.id);
    setActionToDelete(null);
    triggerSuccess('Ação removida do plano com sucesso!');
  };

  const handleAddMicroactionToExisting = (actId: string) => {
    const title = newMicroTitleMap[actId];
    if (!title || !title.trim() || !selectedGoal) return;
    addMicroaction(selectedGoal.id, actId, title.trim());
    setNewMicroTitleMap(prev => ({ ...prev, [actId]: '' }));
    triggerSuccess('Nova microação / etapa adicionada!');
  };

  // --- SUB TAB 2: PROJECTS MANAGEMENT ---
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectResp, setProjectResp] = useState('Coordenadoria de TIC');
  const [projectProgress, setProjectProgress] = useState<number>(0);
  const [projectStatus, setProjectStatus] = useState<'ativo' | 'finalizado' | 'pendente'>('ativo');
  const [projectDueDate, setProjectDueDate] = useState('2026-12-31');
  const [projectDesc, setProjectDesc] = useState('');

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectName('');
    setProjectResp('Coordenadoria de TIC');
    setProjectProgress(0);
    setProjectStatus('ativo');
    setProjectDueDate('2026-12-31');
    setProjectDesc('');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    if (editingProjectId) {
      updateProject(editingProjectId, {
        name: projectName.trim(),
        responsible: projectResp.trim(),
        completionPercent: Number(projectProgress),
        status: projectStatus,
        dueDate: projectDueDate,
        description: projectDesc.trim()
      });
      triggerSuccess(`Projeto "${projectName}" atualizado com sucesso!`);
    } else {
      addProject({
        name: projectName.trim(),
        startDate: '2026-02-01',
        dueDate: projectDueDate,
        status: projectStatus,
        completionPercent: Number(projectProgress),
        budget: 0,
        budgetSpent: 0,
        responsible: projectResp.trim() || 'Coordenadoria de TIC',
        results: [],
        description: projectDesc.trim() || 'Projeto estratégico da Secretaria de Educação de Crateús.',
        schoolsInvolved: []
      });
      triggerSuccess(`Projeto "${projectName}" cadastrado com sucesso!`);
    }
    resetProjectForm();
  };

  const handleStartEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectName(p.name);
    setProjectResp(p.responsible);
    setProjectProgress(p.completionPercent);
    setProjectStatus(p.status);
    setProjectDueDate(p.dueDate);
    setProjectDesc(p.description);
  };

  const handleConfirmDeleteProject = () => {
    if (!projectToDelete) return;
    deleteProject(projectToDelete.id);
    setProjectToDelete(null);
    triggerSuccess('Projeto removido com sucesso!');
  };

  // --- SUB TAB 3: TECHNICAL VISIT MANAGEMENT ---
  const [visitSchoolId, setVisitSchoolId] = useState<string>(state.schools[0]?.id || '');
  const [visitResponsible, setVisitResponsible] = useState<string>('Téc. Reginaldo Santos');
  const [visitDate, setVisitDate] = useState<string>('2026-07-10');
  const [visitDetails, setVisitDetails] = useState<string>('');
  const [visitInternetSpeed, setVisitInternetSpeed] = useState<number>(50);
  const [visitNeedsStr, setVisitNeedsStr] = useState<string>('');
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<{ id: string; schoolName: string } | null>(null);

  const resetVisitForm = () => {
    setEditingVisitId(null);
    setVisitDetails('');
    setVisitNeedsStr('');
  };

  const handleCreateOrUpdateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const school = state.schools.find(s => s.id === visitSchoolId);
    if (!school) return;

    const needsArray = visitNeedsStr.split(',').map(s => s.trim()).filter(Boolean);

    if (editingVisitId) {
      updateTechnicalVisit(editingVisitId, {
        schoolId: visitSchoolId,
        schoolName: school.name,
        date: visitDate,
        responsible: visitResponsible,
        details: visitDetails || 'Vistoria periódica de conectividade e infraestrutura.',
        internetSpeed: Number(visitInternetSpeed),
        mainNeeds: needsArray
      });
      triggerSuccess(`Visita à escola "${school.name}" atualizada com sucesso!`);
    } else {
      addTechnicalVisit({
        schoolId: visitSchoolId,
        schoolName: school.name,
        date: visitDate,
        responsible: visitResponsible,
        details: visitDetails || 'Vistoria periódica de conectividade e infraestrutura realizada de forma preventiva.',
        internetSpeed: Number(visitInternetSpeed),
        mainNeeds: needsArray,
        status: 'realizada',
        photos: []
      });
      triggerSuccess(`Visita técnica registrada com sucesso para: ${school.name}!`);
    }

    resetVisitForm();
  };

  const handleStartEditVisit = (v: TechnicalVisit) => {
    setEditingVisitId(v.id);
    setVisitSchoolId(v.schoolId);
    setVisitResponsible(v.responsible);
    setVisitDate(v.date);
    setVisitDetails(v.details);
    setVisitInternetSpeed(v.internetSpeed);
    setVisitNeedsStr(v.mainNeeds.join(', '));
  };

  const handleConfirmDeleteVisit = () => {
    if (!visitToDelete) return;
    deleteTechnicalVisit(visitToDelete.id);
    setVisitToDelete(null);
    triggerSuccess('Relatório de visita técnica removido com sucesso!');
  };

  // --- SUB TAB 4: FORMATION MANAGEMENT ---
  const [formTitle, setFormTitle] = useState('');
  const [formTheme, setFormTheme] = useState('');
  const [formAudience, setFormAudience] = useState('Professores do Fundamental I');
  const [formDate, setFormDate] = useState('2026-07-10');
  const [formParticipants, setFormParticipants] = useState<number>(30);
  const [formHours, setFormHours] = useState<number>(4);
  const [editingFormationId, setEditingFormationId] = useState<string | null>(null);
  const [formationToDelete, setFormationToDelete] = useState<{ id: string; title: string } | null>(null);

  const resetFormationForm = () => {
    setEditingFormationId(null);
    setFormTitle('');
    setFormTheme('');
  };

  const handleCreateOrUpdateFormation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formTheme) return;

    if (editingFormationId) {
      updateFormation(editingFormationId, {
        title: formTitle,
        date: formDate,
        theme: formTheme,
        audience: formAudience,
        participantsCount: Number(formParticipants),
        hours: Number(formHours)
      });
      triggerSuccess(`Capacitação "${formTitle}" atualizada com sucesso!`);
    } else {
      addFormation({
        title: formTitle,
        date: formDate,
        theme: formTheme,
        audience: formAudience,
        participantsCount: Number(formParticipants),
        status: 'realizada',
        hours: Number(formHours)
      });
      triggerSuccess(`Capacitação Docente "${formTitle}" registrada e contabilizada!`);
    }

    resetFormationForm();
  };

  const handleStartEditFormation = (f: Formation) => {
    setEditingFormationId(f.id);
    setFormTitle(f.title);
    setFormTheme(f.theme);
    setFormAudience(f.audience);
    setFormDate(f.date);
    setFormParticipants(f.participantsCount);
    setFormHours(f.hours);
  };

  const handleConfirmDeleteFormation = () => {
    if (!formationToDelete) return;
    deleteFormation(formationToDelete.id);
    setFormationToDelete(null);
    triggerSuccess('Registro de capacitação removido com sucesso!');
  };

  // --- SUB TAB 5: SCIENCE FAIR MANAGEMENT ---
  const [fairName, setFairName] = useState('');
  const [fairSchoolId, setFairSchoolId] = useState<string>(state.schools[0]?.id || '');
  const [fairDate, setFairDate] = useState('2026-07-10');
  const [fairProjects, setFairProjects] = useState<number>(10);
  const [editingFairId, setEditingFairId] = useState<string | null>(null);
  const [fairToDelete, setFairToDelete] = useState<{ id: string; name: string } | null>(null);

  const resetFairForm = () => {
    setEditingFairId(null);
    setFairName('');
  };

  const handleCreateOrUpdateFair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fairName) return;

    if (editingFairId) {
      updateScienceFair(editingFairId, {
        name: fairName,
        schoolId: fairSchoolId,
        date: fairDate,
        projectsCount: Number(fairProjects)
      });
      triggerSuccess(`Feira de Ciências "${fairName}" atualizada com sucesso!`);
    } else {
      addScienceFair({
        name: fairName,
        schoolId: fairSchoolId,
        schoolName: '',
        date: fairDate,
        projectsCount: Number(fairProjects),
        status: 'realizada'
      });
      triggerSuccess(`Feira de Ciências "${fairName}" adicionada com sucesso!`);
    }

    resetFairForm();
  };

  const handleStartEditFair = (fr: ScienceFair) => {
    setEditingFairId(fr.id);
    setFairName(fr.name);
    setFairSchoolId(fr.schoolId);
    setFairDate(fr.date);
    setFairProjects(fr.projectsCount);
  };

  const handleConfirmDeleteFair = () => {
    if (!fairToDelete) return;
    deleteScienceFair(fairToDelete.id);
    setFairToDelete(null);
    triggerSuccess('Registro de Feira de Ciências removido com sucesso!');
  };

  // --- SUB TAB 5: NEW GOAL ---
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Infraestrutura');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(5);
  const [newGoalUnit, setNewGoalUnit] = useState('Escolas Atendidas');
  const [newGoalDueDate, setNewGoalDueDate] = useState('2026-11-30');
  
  // Single child action creation for new goal
  const [goalInitialActionTitle, setGoalInitialActionTitle] = useState('');
  const [goalInitialActionResp, setGoalInitialActionResp] = useState('Técnico Reginaldo');
  const [goalInitialActionImpact, setGoalInitialActionImpact] = useState<number>(8);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !goalInitialActionTitle) return;

    addGoal({
      title: newGoalTitle,
      category: newGoalCategory,
      description: newGoalDesc || 'Meta cadastrada para acompanhamento estratégico das diretrizes da SME.',
      targetValue: Number(newGoalTarget),
      currentValue: 0,
      unit: newGoalUnit,
      startDate: '2026-07-10',
      dueDate: newGoalDueDate,
      status: 'nao_iniciado',
      actions: [
        {
          title: goalInitialActionTitle,
          completionPercent: 0,
          startDate: '2026-07-10',
          dueDate: newGoalDueDate,
          status: 'nao_iniciado',
          category: newGoalCategory,
          microactionsCount: 5,
          microactionsCompleted: 0,
          responsible: goalInitialActionResp,
          impactScore: Number(goalInitialActionImpact)
        }
      ]
    });

    setNewGoalTitle('');
    setNewGoalDesc('');
    setGoalInitialActionTitle('');
    triggerSuccess(`Nova Meta e Ação criadas com sucesso no Plano de Trabalho!`);
  };

  const getMicroList = (act: any) => {
    if (act.microactionsList && act.microactionsList.length > 0) return act.microactionsList;
    const count = Math.max(act.microactionsCount || 3, 1);
    const completedCount = Math.min(act.microactionsCompleted || 0, count);
    return Array.from({ length: count }, (_, idx) => ({
      id: `m_default_${act.id}_${idx + 1}`,
      title: idx < completedCount 
        ? `Etapa concluída: Verificação e execução do passo ${idx + 1}`
        : `Etapa pendente: Execução do passo operacional ${idx + 1}`,
      completed: idx < completedCount
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 animate-fade-in" id="manage-tab">
      
      {/* Banner / Success alerts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Sliders className="h-5 w-5 text-blue-600" />
            Módulo de Gestão de Dados
          </h2>
          <p className="text-xs text-slate-400 mt-1">Alimente os indicadores do plano e registre o andamento diário das ações</p>
        </div>

        <button
          onClick={() => setShowConfirmResetModal(true)}
          className="text-xs text-red-650 hover:text-red-750 font-bold underline cursor-pointer transition-colors"
          id="btn-reset-data"
        >
          Restaurar Dados Originais
        </button>
      </div>

      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-md border border-slate-800 animate-fade-in">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          {successMsg}
        </div>
      )}

      {/* Grid: Menu choices vs forms panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sub navigation bar */}
        <div className="lg:col-span-3 flex flex-col gap-1">
          {(['actions', 'projects', 'visits', 'formations', 'fairs', 'new-goal', 'schools', 'users', 'coordenadoria', 'cloud-sync'] as const).map((tab) => {
            let label = 'Ações & Objetivos';
            let icon = <CheckSquare className="h-4 w-4" />;
            if (tab === 'projects') { label = 'Projetos Estratégicos'; icon = <BookOpen className="h-4 w-4" />; }
            else if (tab === 'visits') { label = 'Visitas Técnicas'; icon = <Wrench className="h-4 w-4" />; }
            else if (tab === 'formations') { label = 'Capacitações Docentes'; icon = <Users className="h-4 w-4" />; }
            else if (tab === 'fairs') { label = 'Feiras de Ciências'; icon = <Trophy className="h-4 w-4" />; }
            else if (tab === 'new-goal') { label = 'Adicionar Meta'; icon = <ListPlus className="h-4 w-4" />; }
            else if (tab === 'schools') { label = 'Gerenciar Escolas'; icon = <SchoolIcon className="h-4 w-4" />; }
            else if (tab === 'users') { label = 'Equipe & Permissões'; icon = <UserCheck className="h-4 w-4" />; }
            else if (tab === 'coordenadoria') { label = 'Logo & Responsável'; icon = <Building2 className="h-4 w-4" />; }
            else if (tab === 'cloud-sync') { label = 'Nuvem, GitHub & Backup'; icon = <Database className="h-4 w-4" />; }

            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`text-left px-4 py-3 text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 uppercase tracking-wider border shadow-2xs ${
                  activeSubTab === tab 
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md' 
                    : 'bg-slate-200/90 text-slate-800 hover:text-slate-950 hover:bg-slate-300/80 border-slate-300'
                }`}
                id={`subtab-btn-${tab}`}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-9 bg-slate-50/40 p-6 rounded-2xl border border-slate-100">
          
          {/* 1. GESTÃO DE AÇÕES OPERACIONAIS */}
          {activeSubTab === 'actions' && selectedGoal && (
            <div className="space-y-6 animate-fade-in" id="form-update-actions">
              
              {/* Header & Goal Selector */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-1 w-full sm:w-1/2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-blue-600" />
                      Selecionar Objetivo Estratégico
                    </label>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 shadow-xs w-full"
                      id="select-manage-goal"
                    >
                      {state.goals.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleOpenEditGoal}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold px-3 py-3 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Editar este Objetivo Estratégico"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>Editar Meta</span>
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteGoalModal(true)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold px-3 py-3 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Excluir este Objetivo Estratégico"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      <span>Excluir Meta</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAddActionForm(!showAddActionForm);
                        setEditingActionId(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-3 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider shrink-0 cursor-pointer"
                      id="btn-show-add-action"
                    >
                      <PlusCircle className="h-4 w-4" />
                      {showAddActionForm ? 'Fechar' : 'Nova Ação'}
                    </button>
                  </div>
                </div>

                {/* Goal Overview Progress Bar */}
                {(() => {
                  const totalActions = selectedGoal.actions.length;
                  const completedActions = selectedGoal.actions.filter(a => a.status === 'concluido').length;
                  const inProgressActions = selectedGoal.actions.filter(a => a.status === 'em_andamento').length;
                  const overdueActions = selectedGoal.actions.filter(a => a.status === 'atrasado' || (a.completionPercent < 100 && a.dueDate < '2026-07-10')).length;
                  const goalAvgPercent = totalActions > 0 ? Math.round(selectedGoal.actions.reduce((acc, a) => acc + a.completionPercent, 0) / totalActions) : 0;

                  return (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-blue-600" />
                          Barra de Acompanhamento do Objetivo: <strong className="text-blue-600">{goalAvgPercent}% Concluído</strong>
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-semibold">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">Total: {totalActions}</span>
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">Concluídas: {completedActions}</span>
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">Em Curso: {inProgressActions}</span>
                          {overdueActions > 0 && (
                            <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full">Atrasadas: {overdueActions}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${goalAvgPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Formulário de Cadastro de Nova Ação Operacional */}
              {showAddActionForm && (
                <form onSubmit={handleCreateActionSubmit} className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-md space-y-4 animate-fade-in" id="form-create-action">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-xs text-blue-800 uppercase tracking-wider flex items-center gap-2">
                      <PlusCircle className="h-4 w-4 text-blue-600" />
                      Cadastrar Ação Operacional no Plano
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setShowAddActionForm(false)} 
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Título da Ação Operacional *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Formatação e instalação de SSDs nos laboratórios"
                        value={newActionTitle}
                        onChange={(e) => setNewActionTitle(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Categoria Operacional</label>
                      <select
                        value={newActionCategory}
                        onChange={(e) => setNewActionCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      >
                        <option value="Infraestrutura">Infraestrutura</option>
                        <option value="Conectividade">Conectividade</option>
                        <option value="Capacitação">Capacitação / Formação</option>
                        <option value="Pedagogia">Pedagogia e Conteúdo</option>
                        <option value="Agendas Pedagógicas">Agendas Pedagógicas</option>
                        <option value="Gestão">Gestão Escolar</option>
                        <option value="Inovação">Inovação e Robótica</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Técnico / Equipe Responsável</label>
                      <input
                        type="text"
                        placeholder="Ex: Téc. Reginaldo Santos"
                        value={newActionResponsible}
                        onChange={(e) => setNewActionResponsible(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Data de Início</label>
                      <input
                        type="date"
                        value={newActionStartDate}
                        onChange={(e) => setNewActionStartDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Prazo Final (Due Date)</label>
                      <input
                        type="date"
                        value={newActionDueDate}
                        onChange={(e) => setNewActionDueDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Pontuação de Impacto Estratégico (1 a 10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newActionImpact}
                        onChange={(e) => setNewActionImpact(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 w-1/3"
                      />
                    </div>
                  </div>

                  {/* Microções do Checklist inicial */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ListTodo className="h-3.5 w-3.5 text-blue-600" />
                      Checklist Inicial: Microações da Ação (Etapas / Tarefas)
                    </label>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Digite o título da etapa e clique em Adicionar..."
                        value={newActionMicroInput}
                        onChange={(e) => setNewActionMicroInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMicroToNewAction(); } }}
                        className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                      />
                      <button
                        type="button"
                        onClick={handleAddMicroToNewAction}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        + Adicionar Etapa
                      </button>
                    </div>

                    {newActionMicroList.length > 0 && (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-150">
                        {newActionMicroList.map((micro, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs">
                            <span className="font-medium text-slate-700 flex items-center gap-2">
                              <Circle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {micro}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMicroFromNewAction(idx)}
                              className="text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddActionForm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Salvar Nova Ação no Plano
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Ações e Barras de Acompanhamento */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-blue-600" />
                    Ações Operacionais ({selectedGoal.actions.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Clique em "Microações" para ver ou gerenciar o checklist</span>
                </div>
                
                {selectedGoal.actions.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-500">Nenhuma ação cadastrada para este objetivo.</p>
                    <button
                      onClick={() => setShowAddActionForm(true)}
                      className="text-blue-600 hover:text-blue-700 font-extrabold text-xs underline cursor-pointer"
                    >
                      Cadastrar a primeira ação operacional agora
                    </button>
                  </div>
                ) : (
                  selectedGoal.actions.map(act => {
                    const isEditing = editingActionId === act.id;
                    const isOverdue = act.status === 'atrasado' || (act.completionPercent < 100 && act.dueDate < '2026-07-10');
                    const isConcluded = act.status === 'concluido' || act.completionPercent >= 100;
                    const isExpanded = expandedActionIds.includes(act.id);
                    const microList = getMicroList(act);

                    if (isEditing) {
                      return (
                        <form key={act.id} onSubmit={handleSaveEditAction} className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-md space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h5 className="font-extrabold text-xs text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Edit2 className="h-3.5 w-3.5 text-amber-600" />
                              Alterar Ação Operacional
                            </h5>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2 flex flex-col">
                              <label className="text-[10px] font-bold text-slate-500">Título da Ação</label>
                              <input
                                type="text"
                                required
                                value={editActionTitle}
                                onChange={(e) => setEditActionTitle(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold text-slate-500">Categoria</label>
                              <select
                                value={editActionCategory}
                                onChange={(e) => setEditActionCategory(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2"
                              >
                                <option value="Infraestrutura">Infraestrutura</option>
                                <option value="Conectividade">Conectividade</option>
                                <option value="Capacitação">Capacitação / Formação</option>
                                <option value="Pedagogia">Pedagogia e Conteúdo</option>
                                <option value="Agendas Pedagógicas">Agendas Pedagógicas</option>
                                <option value="Gestão">Gestão Escolar</option>
                                <option value="Inovação">Inovação e Robótica</option>
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold text-slate-500">Responsável</label>
                              <input
                                type="text"
                                value={editActionResponsible}
                                onChange={(e) => setEditActionResponsible(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold text-slate-500">Início</label>
                              <input
                                type="date"
                                value={editActionStartDate}
                                onChange={(e) => setEditActionStartDate(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] font-bold text-slate-500">Prazo Final</label>
                              <input
                                type="date"
                                value={editActionDueDate}
                                onChange={(e) => setEditActionDueDate(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl p-2"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setEditingActionId(null)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                            >
                              Salvar Alterações
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div 
                        key={act.id} 
                        className={`bg-white p-5 rounded-2xl border shadow-xs space-y-4 transition-all duration-200 ${
                          isConcluded ? 'border-emerald-200 bg-emerald-50/10' : isOverdue ? 'border-rose-200 bg-rose-50/10' : 'border-slate-150 hover:border-blue-300'
                        }`}
                      >
                        {/* Header & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {act.category}
                              </span>
                              {isConcluded ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Concluído
                                </span>
                              ) : isOverdue ? (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Atrasado (Prazo: {act.dueDate})
                                </span>
                              ) : (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Em Andamento
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-400">
                                Impacto: {act.impactScore || 8}/10
                              </span>
                            </div>
                            <h5 className="font-extrabold text-sm text-slate-900 leading-snug">{act.title}</h5>
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium pt-0.5">
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-3 w-3 text-slate-400" />
                                <strong className="text-slate-700 font-semibold">{act.responsible}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                Início: {act.startDate} | Prazo: <strong className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>{act.dueDate}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Action Toolbar buttons: Edit, Delete, Microactions */}
                          <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                            <button
                              onClick={() => toggleExpandAction(act.id)}
                              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                                isExpanded ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
                              }`}
                              title="Ver ou gerenciar microações da ação"
                            >
                              <ListTodo className="h-3.5 w-3.5" />
                              Microações ({act.microactionsCompleted}/{act.microactionsCount})
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            <button
                              onClick={() => handleStartEditAction(act)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-2 rounded-xl transition-colors cursor-pointer border border-amber-200/50"
                              title="Alterar ação"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => setActionToDelete({ goalId: selectedGoal.id, id: act.id, title: act.title })}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-xl transition-colors cursor-pointer border border-rose-200/50"
                              title="Excluir ação"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Barra de Acompanhamento da Ação */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                              <Activity className="h-3.5 w-3.5 text-blue-600" />
                              Barra de Acompanhamento da Ação:
                            </span>
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-150">
                              {act.completionPercent}%
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isConcluded ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${act.completionPercent}%` }}
                            />
                          </div>

                          {/* Quick progress setter buttons & slider */}
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={act.completionPercent}
                              onChange={(e) => updateActionCompletion(selectedGoal.id, act.id, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              id={`slider-${act.id}`}
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              {[0, 25, 50, 75].map(pct => (
                                <button
                                  key={pct}
                                  onClick={() => updateActionCompletion(selectedGoal.id, act.id, pct)}
                                  className={`text-[9px] font-extrabold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                                    act.completionPercent === pct ? 'bg-blue-600 text-white' : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                              <button
                                onClick={() => updateActionCompletion(selectedGoal.id, act.id, 100)}
                                className={`text-[9px] font-black px-2.5 py-1 rounded-md transition-colors cursor-pointer uppercase tracking-wider ${
                                  act.completionPercent === 100 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                }`}
                              >
                                100% Concluir
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Painel de Microações (Checklist Expandível) */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-fade-in bg-slate-50/80 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                              <h6 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                                Microações / Checklist de Execução ({act.microactionsCompleted}/{act.microactionsCount} concluídos)
                              </h6>
                              <span className="text-[10px] font-bold text-slate-400">Marque os itens para atualizar o percentual</span>
                            </div>

                            <div className="space-y-1.5">
                              {microList.map(micro => (
                                <div 
                                  key={micro.id} 
                                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                    micro.completed ? 'bg-emerald-50/50 border-emerald-200 text-slate-400' : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300 shadow-2xs'
                                  }`}
                                >
                                  <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={micro.completed}
                                      onChange={() => toggleMicroaction(selectedGoal.id, act.id, micro.id)}
                                      className="h-4 w-4 rounded-md text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                                    />
                                    <span className={`text-xs font-semibold ${micro.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                      {micro.title}
                                    </span>
                                  </label>
                                  
                                  <button
                                    type="button"
                                    onClick={() => deleteMicroaction(selectedGoal.id, act.id, micro.id)}
                                    className="text-slate-300 hover:text-rose-600 font-bold p-1 rounded transition-colors cursor-pointer"
                                    title="Excluir microação"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Adicionar nova microação ao item existente */}
                            <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                              <input
                                type="text"
                                placeholder="Adicionar nova microação / etapa a esta ação..."
                                value={newMicroTitleMap[act.id] || ''}
                                onChange={(e) => setNewMicroTitleMap(prev => ({ ...prev, [act.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMicroactionToExisting(act.id); } }}
                                className="flex-1 bg-white border border-slate-250 text-xs rounded-xl p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddMicroactionToExisting(act.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Adicionar Etapa
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 2. GESTÃO DE PROJETOS ESTRATÉGICOS */}
          {activeSubTab === 'projects' && (
            <div className="space-y-6 animate-fade-in" id="subtab-projects">
              <form onSubmit={handleSaveProject} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-xs text-blue-800 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    {editingProjectId ? 'Editar Projeto Estratégico' : 'Cadastrar Novo Projeto Estratégico'}
                  </h4>
                  {editingProjectId && (
                    <button type="button" onClick={resetProjectForm} className="text-xs text-slate-500 hover:text-slate-800 underline font-bold cursor-pointer">
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nome do Projeto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Conectividade Escolar de Alta Velocidade"
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Responsável *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Reginaldo Santos (TIC)"
                      value={projectResp}
                      onChange={e => setProjectResp(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Data Prevista de Conclusão</label>
                    <input
                      type="date"
                      value={projectDueDate}
                      onChange={e => setProjectDueDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Percentual Concluído (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={projectProgress}
                      onChange={e => setProjectProgress(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status Atual</label>
                    <select
                      value={projectStatus}
                      onChange={e => setProjectStatus(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                    >
                      <option value="ativo">Ativo / Em Execução</option>
                      <option value="pendente">Pendente / Planejado</option>
                      <option value="finalizado">Finalizado / Concluído</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Descrição do Projeto</label>
                    <textarea
                      rows={2}
                      placeholder="Detalhes e objetivos deste projeto..."
                      value={projectDesc}
                      onChange={e => setProjectDesc(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold p-3 rounded-xl uppercase tracking-wider shadow-xs cursor-pointer">
                  {editingProjectId ? 'Salvar Alterações do Projeto' : 'Cadastrar Projeto Estratégico'}
                </button>
              </form>

              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Projetos Cadastrados ({state.projects.length})</span>
                </h4>

                {state.projects.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{p.name}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditProject(p)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectToDelete({ id: p.id, name: p.name })}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-2">
                      <span>Responsável: <strong className="text-slate-800">{p.responsible}</strong></span>
                      <span>Prazo: <strong className="text-slate-800">{p.dueDate}</strong></span>
                      <span>Progresso: <strong className="text-blue-600">{p.completionPercent}%</strong></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                        p.status === 'finalizado' ? 'bg-emerald-100 text-emerald-800' : p.status === 'ativo' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. REGISTRAR VISITA TÉCNICA */}
          {activeSubTab === 'visits' && (
            <div className="space-y-6 animate-fade-in" id="subtab-visits">
              <form onSubmit={handleCreateOrUpdateVisit} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs" id="form-register-visit">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-xs text-blue-800 uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    {editingVisitId ? 'Editar Relatório de Visita Técnica' : 'Lançar Nova Visita Técnica de Campo'}
                  </h4>
                  {editingVisitId && (
                    <button type="button" onClick={resetVisitForm} className="text-xs text-slate-500 hover:text-slate-800 underline font-bold cursor-pointer">
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Escola Atendida</label>
                    <select
                      value={visitSchoolId}
                      onChange={(e) => setVisitSchoolId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-visit-school"
                    >
                      {state.schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Técnico / Visitante</label>
                    <input
                      type="text"
                      value={visitResponsible}
                      onChange={(e) => setVisitResponsible(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-visit-resp"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Data da Vistoria</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-visit-date"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Velocidade Medida (Mbps)</label>
                    <input
                      type="number"
                      value={visitInternetSpeed}
                      onChange={(e) => setVisitInternetSpeed(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-visit-speed"
                      min="0"
                      max="1000"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Necessidades Detectadas (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={visitNeedsStr}
                    onChange={(e) => setVisitNeedsStr(e.target.value)}
                    placeholder="Ex: Novo cabo de rede, Substituir disjuntor do laboratório"
                    className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                    id="input-visit-needs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Relato Detalhado do Atendimento</label>
                  <textarea
                    value={visitDetails}
                    onChange={(e) => setVisitDetails(e.target.value)}
                    rows={3}
                    placeholder="Insira detalhes técnicos, equipamentos revisados..."
                    className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-750"
                    id="input-visit-details"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold p-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                  id="submit-register-visit"
                >
                  {editingVisitId ? 'Salvar Alterações da Visita' : 'Salvar Relatório de Visita de Campo'}
                </button>
              </form>

              {/* Existing Visits List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Histórico de Visitas Registradas ({state.visits.length})
                </h4>

                {state.visits.map(v => (
                  <div key={v.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <SchoolIcon className="h-4 w-4 text-blue-600" />
                          {v.schoolName}
                        </h5>
                        <p className="text-xs text-slate-600 mt-1">{v.details}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditVisit(v)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisitToDelete({ id: v.id, schoolName: v.schoolName })}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-2">
                      <span>Técnico: <strong className="text-slate-800">{v.responsible}</strong></span>
                      <span>Data: <strong className="text-slate-800">{v.date}</strong></span>
                      <span>Velocidade: <strong className="text-blue-600">{v.internetSpeed} Mbps</strong></span>
                      {v.mainNeeds && v.mainNeeds.length > 0 && (
                        <span className="text-amber-700">Necessidades: {v.mainNeeds.join(', ')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. LANÇAR CAPACITAÇÃO */}
          {activeSubTab === 'formations' && (
            <div className="space-y-6 animate-fade-in" id="subtab-formations">
              <form onSubmit={handleCreateOrUpdateFormation} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs" id="form-register-formation">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-xs text-blue-800 uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    {editingFormationId ? 'Editar Capacitação Docente' : 'Lançar Nova Capacitação Docente'}
                  </h4>
                  {editingFormationId && (
                    <button type="button" onClick={resetFormationForm} className="text-xs text-slate-500 hover:text-slate-800 underline font-bold cursor-pointer">
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Título do Curso / Oficina</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Introdução à Robótica com Arduino"
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-form-title"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Tema Principal</label>
                    <input
                      type="text"
                      value={formTheme}
                      onChange={(e) => setFormTheme(e.target.value)}
                      placeholder="Ex: Cultura Maker"
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-form-theme"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Público-Alvo</label>
                    <select
                      value={formAudience}
                      onChange={(e) => setFormAudience(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-form-audience"
                    >
                      <option value="Professores do Fundamental I">Professores do Fundamental I</option>
                      <option value="Professores do Fundamental II">Professores do Fundamental II</option>
                      <option value="Coordenadores Pedagógicos">Coordenadores Pedagógicos</option>
                      <option value="Gestores de Escolas">Gestores de Escolas</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Data da Capacitação</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-form-date"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Professores Participantes</label>
                    <input
                      type="number"
                      value={formParticipants}
                      onChange={(e) => setFormParticipants(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-form-parts"
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Carga Horária (horas)</label>
                    <input
                      type="number"
                      value={formHours}
                      onChange={(e) => setFormHours(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-form-hours"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold p-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                  id="submit-register-formation"
                >
                  {editingFormationId ? 'Salvar Alterações da Capacitação' : 'Registrar Capacitação Docente'}
                </button>
              </form>

              {/* Existing Formations List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Capacitações Realizadas ({state.formations.length})
                </h4>

                {state.formations.map(f => (
                  <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{f.title}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Tema: {f.theme} | Público: {f.audience}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditFormation(f)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormationToDelete({ id: f.id, title: f.title })}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-2">
                      <span>Data: <strong className="text-slate-800">{f.date}</strong></span>
                      <span>Participantes: <strong className="text-blue-600">{f.participantsCount} docentes</strong></span>
                      <span>Carga Horária: <strong className="text-slate-800">{f.hours}h</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. REGISTRAR FEIRA CIENTÍFICA */}
          {activeSubTab === 'fairs' && (
            <div className="space-y-6 animate-fade-in" id="subtab-fairs">
              <form onSubmit={handleCreateOrUpdateFair} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs" id="form-register-fair">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-xs text-blue-800 uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    {editingFairId ? 'Editar Feira de Ciências' : 'Registrar Feira de Ciências Escolar'}
                  </h4>
                  {editingFairId && (
                    <button type="button" onClick={resetFairForm} className="text-xs text-slate-500 hover:text-slate-800 underline font-bold cursor-pointer">
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nome da Mostra / Feira</label>
                    <input
                      type="text"
                      value={fairName}
                      onChange={(e) => setFairName(e.target.value)}
                      placeholder="Ex: II Feira Científica de Vilebaldo Martins"
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-fair-name"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Escola Sediadora</label>
                    <select
                      value={fairSchoolId}
                      onChange={(e) => setFairSchoolId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-fair-school"
                    >
                      {state.schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Data de Realização</label>
                    <input
                      type="date"
                      value={fairDate}
                      onChange={(e) => setFairDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-fair-date"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Quantidade de Projetos Expostos</label>
                    <input
                      type="number"
                      value={fairProjects}
                      onChange={(e) => setFairProjects(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700"
                      id="input-fair-projects"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold p-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                  id="submit-register-fair"
                >
                  {editingFairId ? 'Salvar Alterações da Feira' : 'Confirmar Realização de Feira Escolar'}
                </button>
              </form>

              {/* Existing Science Fairs List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Feiras Científicas Registradas ({(state.fairs || []).length})
                </h4>

                {(state.fairs || []).map(fr => (
                  <div key={fr.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{fr.name}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">Sede: {fr.schoolName || 'Escola de Crateús'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditFair(fr)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setFairToDelete({ id: fr.id, name: fr.name })}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-2">
                      <span>Data: <strong className="text-slate-800">{fr.date}</strong></span>
                      <span>Projetos Expostos: <strong className="text-blue-600">{fr.projectsCount} projetos</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ADD NEW GOAL */}
          {activeSubTab === 'new-goal' && (
            <form onSubmit={handleCreateGoal} className="space-y-5 animate-fade-in" id="form-new-goal">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Título da Meta Macro</label>
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Ex: Aquisição de kits Maker"
                    className="bg-white border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                    id="input-newgoal-title"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Categoria Estratégica</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                    id="input-newgoal-cat"
                  >
                    <option value="Infraestrutura">Infraestrutura</option>
                    <option value="Conectividade">Conectividade</option>
                    <option value="Formação">Formação Docente</option>
                    <option value="Inovação Científica">Inovação Científica</option>
                    <option value="Cultura Maker">Cultura Maker</option>
                    <option value="Agendas Pedagógicas">Agendas Pedagógicas</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Valor Alvo (Indicador numérico)</label>
                  <input
                    type="number"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                    className="bg-white border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                    id="input-newgoal-target"
                    min="1"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Unidade de Medida</label>
                  <input
                    type="text"
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    placeholder="Ex: Kits Instalados, Oficinas Realizadas"
                    className="bg-white border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                    id="input-newgoal-unit"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Prazo Final da Meta</label>
                  <input
                    type="date"
                    value={newGoalDueDate}
                    onChange={(e) => setNewGoalDueDate(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                    id="input-newgoal-duedate"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Descrição Explicativa da Meta</label>
                <textarea
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  rows={2}
                  placeholder="Explicação do impacto esperado..."
                  className="bg-white border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-750 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                  id="input-newgoal-desc"
                />
              </div>

              {/* FIRST CHILD ACTION */}
              <div className="p-5 bg-white rounded-2xl border border-dashed border-slate-200 space-y-4">
                <h4 className="font-extrabold text-xs text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="h-4 w-4" /> Ação Inicial Correlata
                </h4>
                <p className="text-[11px] text-slate-450 leading-relaxed font-medium">Cada meta do Plano de Trabalho deve possuir no mínimo uma ação operacional inicial para guiar sua execução de ponta a ponta:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Nome da Ação</label>
                    <input
                      type="text"
                      value={goalInitialActionTitle}
                      onChange={(e) => setGoalInitialActionTitle(e.target.value)}
                      placeholder="Ex: Comprar e licitar microcontroladores"
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                      id="input-newact-title"
                      required={!!newGoalTitle}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Responsável</label>
                    <input
                      type="text"
                      value={goalInitialActionResp}
                      onChange={(e) => setGoalInitialActionResp(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
                      id="input-newact-resp"
                      required={!!newGoalTitle}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold p-3 rounded-full transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                id="submit-new-goal"
              >
                Inserir Meta e Ação no Plano Anual
              </button>
            </form>
          )}

          {/* 6. GERENCIAR ESCOLAS */}
          {activeSubTab === 'schools' && (
            <div className="space-y-8 animate-fade-in" id="form-manage-schools">
              {/* Cadastro em Massa por Planilha Excel */}
              <SchoolExcelUpload onSuccess={() => triggerSuccess('Cadastro em massa concluído com sucesso!')} />

              {/* Cadastro / Edição Manual */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider text-emerald-800">
                  <SchoolIcon className="h-5 w-5" />
                  {editingSchoolId ? `Editar Escola: ${schoolName}` : 'Cadastrar Nova Unidade de Ensino'}
                </h3>
                <p className="text-[11px] text-slate-450 leading-relaxed font-medium">Preencha os campos abaixo com os dados cadastrais, infraestrutura, computadores e conectividade da escola municipal.</p>

                <form onSubmit={handleSaveSchool} className="space-y-6">
                  {/* Grid 1: Basic registration */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Nome da Escola *</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Ex: EEMTI Maria José"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Código INEP *</label>
                      <input
                        type="text"
                        value={schoolInep}
                        onChange={(e) => setSchoolInep(e.target.value)}
                        placeholder="Ex: 23094851"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Bairro / Localidade</label>
                      <input
                        type="text"
                        value={schoolNeighborhood}
                        onChange={(e) => setSchoolNeighborhood(e.target.value)}
                        placeholder="Ex: Centro"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Grid 2: Management & Stage served */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Diretor(es)</label>
                      <input
                        type="text"
                        value={schoolDirectors}
                        onChange={(e) => setSchoolDirectors(e.target.value)}
                        placeholder="Nome dos Diretores"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Coordenador(es)</label>
                      <input
                        type="text"
                        value={schoolCoordinators}
                        onChange={(e) => setSchoolCoordinators(e.target.value)}
                        placeholder="Nome dos Coordenadores"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Grid 2.5: Total de Alunos e Data Informada */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Total de Alunos Matriculados</label>
                      <input
                        type="number"
                        min="0"
                        value={schoolTotalStudents || ''}
                        onChange={(e) => setSchoolTotalStudents(Number(e.target.value))}
                        placeholder="Ex: 450"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Data Informada / Referência</label>
                      <input
                        type="text"
                        value={schoolReportedDate}
                        onChange={(e) => setSchoolReportedDate(e.target.value)}
                        placeholder="Ex: 26/07/2026"
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Level checkboxes */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Etapas de Ensino Atendidas</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schoolServesInfant}
                          onChange={(e) => setSchoolServesInfant(e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Educação Infantil
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schoolServesElem1}
                          onChange={(e) => setSchoolServesElem1(e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Ensino Fundamental - Anos Iniciais
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={schoolServesElem2}
                          onChange={(e) => setSchoolServesElem2(e.target.checked)}
                          className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Ensino Fundamental - Anos Finais
                      </label>
                    </div>
                  </div>

                  {/* Grid 3: Devices Inventory (with Working indicators) */}
                  <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                    <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">Inventário de Computadores e Dispositivos</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Informe as quantidades totais e quantas estão funcionando perfeitamente.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Desktops */}
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-600 block">Computador de Mesa (Desktops)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 block font-bold">Total Qtd</label>
                            <input
                              type="number"
                              min="0"
                              value={schoolDesktopQty}
                              onChange={(e) => setSchoolDesktopQty(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block font-bold">Funciona Qtd</label>
                            <input
                              type="number"
                              min="0"
                              max={schoolDesktopQty}
                              value={schoolDesktopWorking}
                              onChange={(e) => setSchoolDesktopWorking(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notebooks */}
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-600 block">Notebooks / Laptops</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 block font-bold">Total Qtd</label>
                            <input
                              type="number"
                              min="0"
                              value={schoolNotebookQty}
                              onChange={(e) => setSchoolNotebookQty(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block font-bold">Funciona Qtd</label>
                            <input
                              type="number"
                              min="0"
                              max={schoolNotebookQty}
                              value={schoolNotebookWorking}
                              onChange={(e) => setSchoolNotebookWorking(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tablets */}
                      <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-600 block">Tablets Escolares</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 block font-bold">Total Qtd</label>
                            <input
                              type="number"
                              min="0"
                              value={schoolTabletQty}
                              onChange={(e) => setSchoolTabletQty(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block font-bold">Funciona Qtd</label>
                            <input
                              type="number"
                              min="0"
                              max={schoolTabletQty}
                              value={schoolTabletWorking}
                              onChange={(e) => setSchoolTabletWorking(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 4: Connectivity (Bandwidth, Provider, Access Points) */}
                  <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                    <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Wifi className="h-4 w-4 text-emerald-600" />
                      Conexão de Internet e Pontos de Acesso
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col col-span-1">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Velocidade (Megas/Mbps)</label>
                        <input
                          type="number"
                          min="0"
                          value={schoolInternetSpeed}
                          onChange={(e) => setSchoolInternetSpeed(Number(e.target.value))}
                          placeholder="Ex: 100"
                          className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                        />
                      </div>

                      <div className="flex flex-col col-span-1">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Empresa / Provedor</label>
                        <input
                          type="text"
                          value={schoolInternetProvider}
                          onChange={(e) => setSchoolInternetProvider(e.target.value)}
                          placeholder="Ex: Brisanet, Oi Fibra"
                          className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                        />
                      </div>

                      <div className="flex flex-col col-span-2">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Adicionar Ponto de Acesso</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAccessPoint}
                            onChange={(e) => setNewAccessPoint(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAccessPoint(); } }}
                            placeholder="Ex: Refeitório, Pátio, Bloco B"
                            className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddAccessPoint}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Access points tag list */}
                    {schoolAccessPoints.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Pontos de Acesso Cadastrados:</span>
                        <div className="flex flex-wrap gap-2">
                          {schoolAccessPoints.map((point, index) => (
                            <span key={index} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100">
                              {point}
                              <button
                                type="button"
                                onClick={() => handleRemoveAccessPoint(point)}
                                className="text-emerald-500 hover:text-emerald-800 cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Level & Quality selects */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Nível de Infraestrutura Geral</label>
                      <select
                        value={schoolInfraLevel}
                        onChange={(e) => setSchoolInfraLevel(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                      >
                        <option value="Insuficiente">Insuficiente</option>
                        <option value="Aceitável">Aceitável</option>
                        <option value="Bom">Bom</option>
                        <option value="Excelente">Excelente</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-1">Estabilidade / Qualidade da Internet</label>
                      <select
                        value={schoolInternetQuality}
                        onChange={(e) => setSchoolInternetQuality(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-700 focus:ring-2 focus:ring-emerald-600/10 shadow-xs"
                      >
                        <option value="Sem Conexão">Sem Conexão</option>
                        <option value="Ruim">Ruim</option>
                        <option value="Instável">Instável</option>
                        <option value="Boa">Boa</option>
                        <option value="Excelente">Excelente</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold p-3 rounded-full transition-all cursor-pointer uppercase tracking-wider shadow-md"
                    >
                      {editingSchoolId ? 'Salvar Alterações da Escola' : 'Cadastrar Escola'}
                    </button>

                    {editingSchoolId && (
                      <button
                        type="button"
                        onClick={resetSchoolForm}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-extrabold p-3 rounded-full transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* REGISTERED SCHOOLS LIST */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    Escolas Cadastradas ({state.schools.length})
                  </h3>
                  {state.schools.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteAllSchools}
                      className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold px-3 py-1.5 rounded-xl text-[11px] border border-red-200 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                      title="Excluir todas as escolas cadastradas"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Excluir Todas as Escolas ({state.schools.length})</span>
                    </button>
                  )}
                </div>

                {state.schools.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center space-y-2">
                    <SchoolIcon className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-600">Nenhuma escola cadastrada no momento</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">Utilize o formulário acima para cadastrar as escolas da rede municipal e alimentar os indicadores de infraestrutura.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.schools.map((school) => (
                      <div key={school.id} className="bg-white p-5 rounded-2xl border border-slate-100/80 shadow-xs hover:shadow-sm hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between">
                        <div className="space-y-3.5">
                          {/* Header */}
                          <div className="flex justify-between items-start gap-2 border-b border-slate-50 pb-2">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">{school.name}</h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[9px] bg-slate-100 text-slate-500 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                                  INEP: {school.inep || 'N/A'}
                                </span>
                                <span className="text-[9px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                                  Bairro: {school.neighborhood}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditSchool(school)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Editar dados da escola"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchool(school.id, school.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir escola cadastrada"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Level checklists badges */}
                          <div className="flex flex-wrap gap-1">
                            {school.servesInfant && (
                              <span className="text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">Infantil</span>
                            )}
                            {school.servesElementary1 && (
                              <span className="text-[8px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">Fund. Anos Iniciais</span>
                            )}
                            {school.servesElementary2 && (
                              <span className="text-[8px] font-extrabold uppercase bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-100">Fund. Anos Finais</span>
                            )}
                            {!school.servesInfant && !school.servesElementary1 && !school.servesElementary2 && (
                              <span className="text-[8px] font-extrabold uppercase bg-slate-100 text-slate-450 px-2 py-0.5 rounded-full">Sem nível cadastrado</span>
                            )}
                          </div>

                          {/* Management Staff */}
                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <p><strong className="text-slate-700 font-semibold">Diretor:</strong> {school.directors || 'Não informado'}</p>
                            <p><strong className="text-slate-700 font-semibold">Coordenador:</strong> {school.coordinators || 'Não informado'}</p>
                            {school.totalStudents !== undefined && school.totalStudents > 0 && (
                              <p><strong className="text-slate-700 font-semibold">Alunos:</strong> <span className="font-mono font-bold text-emerald-700">{school.totalStudents.toLocaleString('pt-BR')}</span></p>
                            )}
                            {school.reportedDate && (
                              <p><strong className="text-slate-700 font-semibold">Data Informada:</strong> <span className="font-mono text-slate-600">{school.reportedDate}</span></p>
                            )}
                          </div>

                          {/* Device summary stats */}
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div>
                              <span className="text-slate-400 block font-medium">Desktops</span>
                              <span className="font-bold text-slate-700 font-mono">{school.desktopQty || 0} ({school.desktopWorkingQty || 0} ok)</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Notebooks</span>
                              <span className="font-bold text-slate-700 font-mono">{school.notebookQty || 0} ({school.notebookWorkingQty || 0} ok)</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Tablets</span>
                              <span className="font-bold text-slate-700 font-mono">{school.tabletQty || 0} ({school.tabletWorkingQty || 0} ok)</span>
                            </div>
                          </div>

                          {/* Internet info */}
                          <div className="space-y-1.5 text-[11px] border-t border-slate-50 pt-2.5">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3 text-slate-400" />
                                Velocidade:
                              </span>
                              <strong className="text-slate-800 font-bold font-mono">{school.internetSpeedMbps || 0} Mbps</strong>
                            </div>

                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1">
                                <Network className="h-3 w-3 text-slate-400" />
                                Operadora:
                              </span>
                              <strong className="text-slate-800 font-semibold">{school.internetProvider || 'Não informada'}</strong>
                            </div>

                            {school.internetAccessPoints && school.internetAccessPoints.length > 0 && (
                              <div className="text-[10px] text-slate-500 pt-1">
                                <span className="font-bold text-[9px] text-slate-400 block uppercase mb-0.5">Pontos de Acesso:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {school.internetAccessPoints.map((ap, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded border border-slate-200/50">{ap}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status row */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-150">
                          <span className="text-[10px] text-slate-400 font-medium">Infraestrutura: <strong className="text-slate-700">{school.infrastructureLevel}</strong></span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            school.status === 'atendida' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {school.status === 'atendida' ? 'Atendida' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. GESTÃO DE USUÁRIOS & EQUIPE DA COORDENADORIA */}
          {activeSubTab === 'users' && (
            <div className="space-y-6 animate-fade-in" id="subtab-users">
              <UserManagementSubTab />
            </div>
          )}

          {/* 8. IDENTIDADE VISUAL & RESPONSÁVEL DA COORDENADORIA */}
          {activeSubTab === 'coordenadoria' && (
            <div className="space-y-6 animate-fade-in" id="subtab-coordenadoria">
              <form onSubmit={handleSaveCoordenadoria} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                      Identidade Visual & Responsável da Coordenadoria
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Cadastre a logo oficial e defina o nome do responsável para aparecer em destaque no cabeçalho e nos relatórios do sistema.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LOGO CADASTRO */}
                  <div className="space-y-4 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/80">
                    <label className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                      <Image className="h-4 w-4 text-emerald-600" />
                      Logo da Coordenadoria / SME
                    </label>
                    
                    {/* Visual Preview */}
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
                      {logoUrlInput ? (
                        <div className="relative group">
                          <img 
                            src={logoUrlInput} 
                            alt="Preview Logo" 
                            className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-1 border border-emerald-300 shadow-xs" 
                          />
                          <button
                            type="button"
                            onClick={() => setLogoUrlInput('')}
                            className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md text-xs cursor-pointer"
                            title="Remover logo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-800 rounded-xl flex items-center justify-center font-black text-white text-2xl border border-emerald-400/40 shadow-xs shrink-0">
                          C
                        </div>
                      )}
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-slate-800">
                          {logoUrlInput ? 'Logo Cadastrada' : 'Nenhuma logo customizada'}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {logoUrlInput ? 'Esta imagem é exibida no cabeçalho e menus.' : 'Envie um arquivo PNG/JPG ou insira uma URL com o brasão/marca.'}
                        </p>
                      </div>
                    </div>

                    {/* Image Upload Input */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 block">
                        Fazer Upload de Arquivo de Imagem (PNG/JPG)
                      </label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoFileUpload}
                        className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer bg-white rounded-xl border border-slate-200 p-1"
                      />
                    </div>

                    {/* Direct Image URL input */}
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 block">
                        Ou insira a URL do Arquivo de Imagem
                      </label>
                      <input 
                        type="url"
                        placeholder="https://exemplo.com/logo-coordenadoria.png"
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                        className="w-full bg-white border border-slate-250 text-xs font-medium rounded-xl p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
                      />
                    </div>
                  </div>

                  {/* RESPONSÁVEL DA COORDENADORIA */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                    <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      Responsável pela Coordenadoria
                    </label>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 block">
                        Nome do Responsável / Coordenador(a) *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Prof. Francisco Reginaldo"
                        value={coordNameInput}
                        onChange={(e) => setCoordNameInput(e.target.value)}
                        className="w-full bg-white border border-slate-250 text-xs font-bold rounded-xl p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 block">
                        Cargo / Função Oficial
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Coordenador de Inovação e Culturas Digitais"
                        value={coordRoleInput}
                        onChange={(e) => setCoordRoleInput(e.target.value)}
                        className="w-full bg-white border border-slate-250 text-xs font-bold rounded-xl p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 shadow-2xs"
                      />
                    </div>

                    {/* Preview Badge */}
                    <div className="pt-3 border-t border-slate-200/60">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Visualização no Cabeçalho</p>
                      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 p-3 rounded-2xl text-white border border-emerald-800 shadow-md">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-400 flex items-center justify-center text-emerald-300 font-bold shrink-0">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-extrabold text-emerald-400 tracking-wider">Responsável Coordenadoria</p>
                          <p className="text-xs font-black text-white">{coordNameInput || 'Não informado'}</p>
                          <p className="text-[10px] text-emerald-300 italic">{coordRoleInput}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Salvar Identidade & Logo
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 7. CLOUD SYNC, GITHUB & BACKUP MANAGEMENT */}
          {activeSubTab === 'cloud-sync' && (
            <div className="space-y-8 animate-fade-in" id="form-cloud-sync">
              
              {/* Header */}
              <div className="border-b border-slate-200/80 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                      <Database className="h-5 w-5 text-blue-600" />
                      Central de Persistência, GitHub e Backup em Nuvem
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure a gravação automática no repositório do GitHub, conexão com Google Drive ou faça download de arquivos .JSON
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. SEÇÃO PRINCIPAL: PERSISTÊNCIA NA BASE DO GITHUB */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg space-y-6 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 text-white">
                      <Github className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                        Base de Dados no Repositório do GitHub
                        {state.githubConfig?.repo && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Ativo
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Salva todos os cadastros e alterações no arquivo <code className="text-yellow-300 font-mono">public/data/crateus_database.json</code> via API do GitHub.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncWithGitHubNow()}
                      disabled={isSyncingGitHub}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingGitHub ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CloudUpload className="h-3.5 w-3.5" />}
                      <span>Salvar no GitHub Agora</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Carregar dados mais recentes do repositório do GitHub? Alterações locais não salvas serão substituídas.')) {
                          loadFromGitHubNow();
                        }
                      }}
                      disabled={isSyncingGitHub}
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CloudDownload className="h-3.5 w-3.5 text-blue-300" />
                      <span>Carregar do GitHub</span>
                    </button>
                  </div>
                </div>

                {/* GitHub Configuration Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateGitHubConfig({
                      repo: ghRepoInput.trim(),
                      token: ghTokenInput.trim(),
                      branch: ghBranchInput.trim() || 'main',
                      autoSync: ghAutoSyncInput
                    });
                    triggerSuccess('Configuração do GitHub salva! A base sincronizará automaticamente com seu repositório.');
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Repositório (usuario/repositorio)
                    </label>
                    <input
                      type="text"
                      value={ghRepoInput}
                      onChange={(e) => setGhRepoInput(e.target.value)}
                      placeholder="ex: seu-usuario/crateus-gestao"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Personal Access Token (PAT)
                    </label>
                    <input
                      type="password"
                      value={ghTokenInput}
                      onChange={(e) => setGhTokenInput(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Branch do Repositório
                    </label>
                    <input
                      type="text"
                      value={ghBranchInput}
                      onChange={(e) => setGhBranchInput(e.target.value)}
                      placeholder="main"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ghAutoSyncInput}
                        onChange={(e) => setGhAutoSyncInput(e.target.checked)}
                        className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-300 font-semibold">
                        Sincronizar no GitHub automaticamente sempre que alterar ou cadastrar algo
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="bg-white text-slate-900 hover:bg-slate-100 font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider"
                    >
                      Salvar Credenciais do GitHub
                    </button>
                  </div>
                </form>

                {state.githubConfig?.lastSync && (
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Última sincronização no GitHub: <span className="text-white font-bold">{state.githubConfig.lastSync}</span>
                  </div>
                )}
              </div>

              {/* 2. SEÇÃO: GOOGLE DRIVE & ORIENTAÇÃO DO GITHUB PAGES */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                      <Cloud className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        Backup no Google Drive
                        {isDriveConnected && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            Conectado: {user?.email}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Gera e atualiza o arquivo <strong className="font-mono text-slate-700">crateus_gestao_estrategica_backup.json</strong> no seu Drive pessoal.
                      </p>
                    </div>
                  </div>

                  <div>
                    {!isDriveConnected ? (
                      <button
                        onClick={connectToDrive}
                        disabled={isSyncingDrive}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Cloud className="h-3.5 w-3.5" />
                        <span>Conectar Google Drive</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveToDriveNow(false)}
                          disabled={isSyncingDrive}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-all"
                        >
                          Salvar no Drive
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Carregar dados do Google Drive? Substituirá os dados da tela.')) {
                              loadFromDriveNow();
                            }
                          }}
                          disabled={isSyncingDrive}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-blue-200 cursor-pointer transition-all"
                        >
                          Restaurar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Desconectar a conta do Google Drive?')) {
                              disconnectFromDrive();
                            }
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold underline ml-2 cursor-pointer"
                        >
                          Desconectar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dica para o usuário sobre o erro de autorização no GitHub Pages */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                  <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="block font-bold">Aviso importante para o Google Drive no GitHub Pages:</strong>
                    <p className="text-amber-800 leading-relaxed">
                      Se você estiver acessando pelo link do GitHub Pages (ex: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">usuario.github.io</code>) e a tela de login do Google fechar com erro de domínio não autorizado, basta adicionar o endereço do seu GitHub Pages em <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</strong>.
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      Enquanto isso, a <strong>Base de Dados do GitHub</strong> e o <strong>Backup em Arquivo .JSON</strong> funcionam 100% diretamente sem depender de autorização de domínio!
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. SEÇÃO: BACKUP E RESTAURAÇÃO LOCAL (.JSON) */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <FileDown className="h-5 w-5 text-slate-700" />
                      Backup Offline em Arquivo Local (.JSON)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Baixe uma cópia completa dos dados para o seu computador ou carregue um arquivo existente a qualquer momento.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportLocalJson}
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <FileDown className="h-4 w-4 text-emerald-400" />
                      <span>Baixar Arquivo .JSON</span>
                    </button>

                    <label className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer">
                      <FileUp className="h-4 w-4 text-blue-600" />
                      <span>Restaurar de Arquivo .JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (window.confirm(`Deseja carregar os dados contidos no arquivo "${file.name}"?`)) {
                              importLocalJson(file);
                            }
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL: Excluir Todas as Escolas */}
      {showConfirmDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left relative overflow-hidden">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="bg-red-100 p-2.5 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Excluir Todas as Escolas?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
              Atenção: Tem certeza de que deseja excluir <strong className="text-slate-800">TODAS as {state.schools.length} escolas</strong> cadastradas na plataforma? Esta ação apagará todo o inventário e dados cadastrais de forma imediata.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteAllModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAllSchoolsAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sim, Excluir Todas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Excluir Escola Individual */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left relative overflow-hidden">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="bg-red-100 p-2.5 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Apagar Escola?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
              Tem certeza de que deseja apagar a escola <strong className="text-slate-800">"{schoolToDelete.name}"</strong>? Todo o inventário de equipamentos e dados informados serão perdidos.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSchoolToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteSchoolAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sim, Apagar Escola</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Restaurar Dados Padrão */}
      {showConfirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left relative overflow-hidden">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Restaurar Dados Originais?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
              Tem certeza de que deseja restaurar as configurações e dados padrão de Crateús? Todas as alterações não salvas no backup em nuvem serão substituídas pelos dados iniciais do sistema.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmResetAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sim, Restaurar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão de Ação Operacional */}
      {actionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Excluir Ação Operacional?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Tem certeza que deseja excluir a ação: <strong className="text-slate-900">"{actionToDelete.title}"</strong> do plano de trabalho? Esta operação removerá o item da linha do tempo e relatórios.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sim, Excluir Ação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Editar Objetivo Estratégico */}
      {showEditGoalModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleSaveGoal} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                Editar Objetivo Estratégico
              </h3>
              <button type="button" onClick={() => setShowEditGoalModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Título do Objetivo</label>
                <input
                  type="text"
                  required
                  value={editGoalTitle}
                  onChange={e => setEditGoalTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Categoria</label>
                  <select
                    value={editGoalCategory}
                    onChange={e => setEditGoalCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Infraestrutura">Infraestrutura</option>
                    <option value="Conectividade">Conectividade</option>
                    <option value="Formação">Formação Docente</option>
                    <option value="Inovação Científica">Inovação Científica</option>
                    <option value="Cultura Maker">Cultura Maker</option>
                    <option value="Agendas Pedagógicas">Agendas Pedagógicas</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={editGoalStatus}
                    onChange={e => setEditGoalStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="em_andamento">Em Andamento</option>
                    <option value="nao_iniciado">Não Iniciado</option>
                    <option value="concluido">Concluído</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Meta Numérica</label>
                  <input
                    type="number"
                    value={editGoalTarget}
                    onChange={e => setEditGoalTarget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Unidade</label>
                  <input
                    type="text"
                    value={editGoalUnit}
                    onChange={e => setEditGoalUnit(e.target.value)}
                    placeholder="Ex: Escolas"
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Prazo Final</label>
                  <input
                    type="date"
                    value={editGoalDueDate}
                    onChange={e => setEditGoalDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Descrição detalhada</label>
                <textarea
                  rows={2}
                  value={editGoalDesc}
                  onChange={e => setEditGoalDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-2.5 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditGoalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
              >
                Salvar Objetivo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Excluir Objetivo Estratégico */}
      {showDeleteGoalModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Excluir Objetivo Estratégico?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Tem certeza que deseja excluir o objetivo <strong className="text-slate-900">"{selectedGoal.title}"</strong>? Todas as <strong className="text-rose-600">{selectedGoal.actions.length} ações vinculadas</strong> a este objetivo também serão permanentemente removidas.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteGoalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGoal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sim, Excluir Meta e Ações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Excluir Projeto Estratégico */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Excluir Projeto Estratégico?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Tem certeza que deseja apagar o projeto <strong className="text-slate-900">"{projectToDelete.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProject}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Projeto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Excluir Visita Técnica */}
      {visitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Excluir Relatório de Visita?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Tem certeza que deseja apagar o registro de visita técnica da escola <strong className="text-slate-900">"{visitToDelete.schoolName}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVisitToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVisit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Visita</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Excluir Capacitação Docente */}
      {formationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Excluir Capacitação Docente?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Tem certeza que deseja apagar a capacitação <strong className="text-slate-900">"{formationToDelete.title}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFormationToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFormation}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Excluir Feira Científica */}
      {fairToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Excluir Feira de Ciências?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Tem certeza que deseja remover a feira <strong className="text-slate-900">"{fairToDelete.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFairToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFair}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Feira</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
