export interface School {
  id: string;
  name: string;
  neighborhood: string;
  infrastructureLevel: 'Insuficiente' | 'Aceitável' | 'Bom' | 'Excelente';
  internetQuality: 'Sem Conexão' | 'Ruim' | 'Instável' | 'Boa' | 'Excelente';
  internetSpeedMbps: number;
  equipmentCataloged: number;
  equipmentRecovered: number;
  equipmentDefective: number;
  lastVisitDate?: string;
  visitsCount: number;
  needs: string[];
  recommendations: string[];
  pendingActions: string[];
  status: 'atendida' | 'pendente';
  
  // New Fields
  inep: string;
  servesInfant: boolean;
  servesElementary1: boolean;
  servesElementary2: boolean;
  directors: string;
  coordinators: string;
  desktopQty: number;
  desktopWorkingQty: number;
  notebookQty: number;
  notebookWorkingQty: number;
  tabletQty: number;
  tabletWorkingQty: number;
  internetProvider: string;
  internetAccessPoints: string[];
  totalStudents?: number;
  reportedDate?: string;
}

export interface WorkPlanAction {
  id: string;
  goalId: string;
  title: string;
  completionPercent: number;
  startDate: string;
  dueDate: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado';
  category: string;
  microactionsCount: number;
  microactionsCompleted: number;
  microactionsList?: { id: string; title: string; completed: boolean }[];
  responsible: string;
  responsibleId?: string;
  impactScore: number; // 1 to 10
}

export interface WorkPlanGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  dueDate: string;
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado';
  category: string;
  description: string;
  actions: WorkPlanAction[];
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  dueDate: string;
  status: 'ativo' | 'finalizado' | 'pendente';
  completionPercent: number;
  budget: number;
  budgetSpent: number;
  responsible: string;
  results: string[];
  description: string;
  schoolsInvolved: string[]; // School IDs
}

export interface TechnicalVisit {
  id: string;
  schoolId: string;
  schoolName: string;
  date: string;
  responsible: string;
  details: string;
  internetSpeed: number;
  mainNeeds: string[];
  status: 'realizada' | 'pendente';
  photos: string[];
}

export interface Formation {
  id: string;
  title: string;
  date: string;
  theme: string;
  audience: string;
  participantsCount: number;
  status: 'realizada' | 'planejada';
  hours: number;
}

export interface ScienceFair {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
  date: string;
  projectsCount: number;
  status: 'realizada' | 'planejada';
}

export type PeriodType = 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';

export interface SystemSettings {
  logoUrl?: string;
  coordinatorName?: string;
  coordinatorRole?: string;
}

export interface TeamUser {
  id: string;
  name: string;
  roleTitle: string; // Cargo/Função ex: "Técnico de Suporte", "Coordenador Pedagógico"
  email: string;
  phone?: string;
  password?: string; // Senha de acesso
  role: 'administrador' | 'membro';
  status: 'ativo' | 'inativo';
  avatarUrl?: string;
  allowedTabs: ('dashboard' | 'timeline' | 'pending' | 'achieved' | 'reports' | 'manage')[];
  allowedSubTabs?: string[]; // Allowed subtabs in manage module e.g. 'actions', 'projects', 'visits', 'schools'
  assignedGoalIds?: string[];
  assignedActionIds?: string[];
  notes?: string;
  createdAt: string;
}

export interface GitHubConfig {
  repo?: string; // ex: "usuario/repositorio"
  token?: string; // GitHub Personal Access Token (PAT)
  branch?: string; // ex: "main" ou "master"
  path?: string; // ex: "data/database.json"
  gistId?: string; // ID do Gist opcional
  autoSync?: boolean;
  lastSync?: string;
  lastStatus?: 'success' | 'error' | 'syncing';
}

export interface StrategicState {
  schools: School[];
  goals: WorkPlanGoal[];
  projects: Project[];
  visits: TechnicalVisit[];
  formations: Formation[];
  fairs: ScienceFair[];
  teamUsers: TeamUser[];
  currentUserId: string;
  isLoggedIn?: boolean;
  activeTab: 'dashboard' | 'timeline' | 'pending' | 'achieved' | 'reports' | 'manage';
  activeSubTab?: string;
  systemSettings?: SystemSettings;
  githubConfig?: GitHubConfig;
}
