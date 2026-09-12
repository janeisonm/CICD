import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { School, WorkPlanGoal, WorkPlanAction, Project, TechnicalVisit, Formation, ScienceFair, StrategicState, SystemSettings, TeamUser, GitHubConfig } from '../types';
import { initialSchools, initialGoals, initialProjects, initialVisits, initialFormations, initialFairs, initialTeamUsers } from '../data/initialData';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logoutGoogle, saveToGoogleDrive, loadFromGoogleDrive, searchBackupFile } from '../services/googleDriveService';
import { saveStateToGitHub, loadStateFromGitHub, downloadLocalJsonBackup, readJsonBackupFile } from '../services/githubStorageService';

const defaultSystemSettings: SystemSettings = {
  logoUrl: '',
  coordinatorName: 'Prof. Francisco Reginaldo',
  coordinatorRole: 'Coordenador da CICD'
};

interface StateContextType {
  state: StrategicState;
  currentUser: TeamUser;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  addTeamUser: (userData: Omit<TeamUser, 'id' | 'createdAt'>) => void;
  updateTeamUser: (userId: string, updatedData: Partial<TeamUser>) => void;
  deleteTeamUser: (userId: string) => void;
  setCurrentUserId: (userId: string) => void;
  updateUserProfile: (userId: string, name: string, roleTitle: string) => void;
  loginWithPassword: (emailOrName: string, passwordInput: string) => { success: boolean; message?: string };
  logout: () => void;
  resetUserPassword: (userId: string, newPassword?: string) => string;
  changeUserPassword: (userId: string, currentPass: string, newPass: string) => { success: boolean; message: string };
  addTechnicalVisit: (visit: Omit<TechnicalVisit, 'id'>) => void;
  updateTechnicalVisit: (visitId: string, visit: Partial<TechnicalVisit>) => void;
  deleteTechnicalVisit: (visitId: string) => void;
  addSchool: (school: School) => void;
  addSchoolsBulk: (schools: School[]) => void;
  deleteSchool: (schoolId: string) => void;
  deleteAllSchools: () => void;
  updateSchool: (school: School) => void;
  updateActionCompletion: (goalId: string, actionId: string, completionPercent: number) => void;
  addAction: (goalId: string, actionData: Omit<WorkPlanAction, 'id'>) => void;
  updateAction: (goalId: string, actionId: string, updatedData: Partial<WorkPlanAction>) => void;
  deleteAction: (goalId: string, actionId: string) => void;
  addMicroaction: (goalId: string, actionId: string, title: string) => void;
  toggleMicroaction: (goalId: string, actionId: string, microactionId: string) => void;
  deleteMicroaction: (goalId: string, actionId: string, microactionId: string) => void;
  addFormation: (formation: Omit<Formation, 'id'>) => void;
  updateFormation: (formationId: string, formation: Partial<Formation>) => void;
  deleteFormation: (formationId: string) => void;
  addScienceFair: (fair: Omit<ScienceFair, 'id'>) => void;
  updateScienceFair: (fairId: string, fair: Partial<ScienceFair>) => void;
  deleteScienceFair: (fairId: string) => void;
  addGoal: (goal: Omit<WorkPlanGoal, 'id' | 'actions'> & { actions: Omit<WorkPlanGoal['actions'][0], 'id'>[] }) => void;
  updateGoal: (goalId: string, goal: Partial<WorkPlanGoal>) => void;
  deleteGoal: (goalId: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (projectId: string, project: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setActiveTab: (tab: StrategicState['activeTab'], subTab?: string) => void;
  resetData: () => void;
  // Google Drive Sync
  user: User | null;
  driveToken: string | null;
  isDriveConnected: boolean;
  isSyncingDrive: boolean;
  lastDriveSync: string | null;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  connectToDrive: () => Promise<void>;
  disconnectFromDrive: () => Promise<void>;
  saveToDriveNow: (silent?: boolean) => Promise<boolean>;
  loadFromDriveNow: () => Promise<boolean>;
  // GitHub & Local Database Persistence
  isSyncingGitHub: boolean;
  updateGitHubConfig: (config: Partial<GitHubConfig>) => void;
  syncWithGitHubNow: (silent?: boolean) => Promise<boolean>;
  loadFromGitHubNow: () => Promise<boolean>;
  exportLocalJson: () => void;
  importLocalJson: (file: File) => Promise<boolean>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StrategicState>(() => {
    const saved = localStorage.getItem('crateus_gestao_estrategica');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.schools || parsed.goals || parsed.projects) {
          return {
            ...parsed,
            schools: parsed.schools || initialSchools,
            goals: parsed.goals || initialGoals,
            projects: parsed.projects || initialProjects,
            visits: parsed.visits || initialVisits,
            formations: parsed.formations || initialFormations,
            fairs: parsed.fairs || initialFairs,
            teamUsers: parsed.teamUsers && parsed.teamUsers.length > 0 
              ? parsed.teamUsers.map((u: any) => ({
                  ...u,
                  password: u.password || 'Crateus@123'
                }))
              : initialTeamUsers,
            currentUserId: parsed.currentUserId || 'usr_admin_1',
            systemSettings: {
              ...defaultSystemSettings,
              ...(parsed.systemSettings || {})
            },
            activeTab: parsed.activeTab || 'dashboard',
            isLoggedIn: false, // O site sempre abre pela tela de login ao ser acessado
            githubConfig: parsed.githubConfig || {
              repo: '',
              token: '',
              branch: 'main',
              path: 'data/database.json',
              autoSync: false,
            }
          };
        }
      } catch (e) {
        console.error('Error parsing local storage state, using initial', e);
      }
    }
    return {
      schools: initialSchools,
      goals: initialGoals,
      projects: initialProjects,
      visits: initialVisits,
      formations: initialFormations,
      fairs: initialFairs,
      teamUsers: initialTeamUsers,
      currentUserId: 'usr_admin_1',
      systemSettings: defaultSystemSettings,
      activeTab: 'dashboard',
      isLoggedIn: false, // O site sempre abre pela tela de login ao ser acessado
      githubConfig: {
        repo: '',
        token: '',
        branch: 'main',
        path: 'data/database.json',
        autoSync: false,
      }
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('crateus_gestao_estrategica', JSON.stringify(state));
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  }, [state]);

  const addTeamUser = (userData: Omit<TeamUser, 'id' | 'createdAt'>) => {
    const newId = `usr_${Date.now()}`;
    const newUser: TeamUser = {
      ...userData,
      password: userData.password || 'Crateus@123',
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({
      ...prev,
      teamUsers: [...(prev.teamUsers || initialTeamUsers), newUser]
    }));
  };

  const updateTeamUser = (userId: string, updatedData: Partial<TeamUser>) => {
    setState(prev => {
      const currentList = prev.teamUsers || initialTeamUsers;
      const updatedList = currentList.map(u => u.id === userId ? { ...u, ...updatedData } : u);
      const targetUser = updatedList.find(u => u.id === userId);

      const isTargetAdminOrCurrent = userId === prev.currentUserId || targetUser?.role === 'administrador';
      const updatedSettings = isTargetAdminOrCurrent ? {
        ...(prev.systemSettings || defaultSystemSettings),
        ...(targetUser?.name ? { coordinatorName: targetUser.name } : {}),
        ...(targetUser?.roleTitle ? { coordinatorRole: targetUser.roleTitle } : {})
      } : prev.systemSettings;

      return {
        ...prev,
        teamUsers: updatedList,
        systemSettings: updatedSettings
      };
    });
  };

  const deleteTeamUser = (userId: string) => {
    setState(prev => {
      const currentList = prev.teamUsers || initialTeamUsers;
      const filtered = currentList.filter(u => u.id !== userId);
      const nextId = prev.currentUserId === userId ? (filtered[0]?.id || 'usr_admin_1') : prev.currentUserId;
      return {
        ...prev,
        teamUsers: filtered,
        currentUserId: nextId
      };
    });
  };

  const setCurrentUserId = (userId: string) => {
    setState(prev => ({
      ...prev,
      currentUserId: userId,
      isLoggedIn: true
    }));
  };

  const loginWithPassword = (emailOrName: string, passwordInput: string) => {
    const list = state.teamUsers || initialTeamUsers;
    const term = emailOrName.trim().toLowerCase();
    
    // find user by email or name
    const foundUser = list.find(u => 
      u.email.toLowerCase() === term || 
      u.name.toLowerCase() === term ||
      u.email.toLowerCase().split('@')[0] === term
    );

    if (!foundUser) {
      return { success: false, message: 'Usuário ou e-mail não encontrado na base da Coordenadoria.' };
    }

    if (foundUser.status === 'inativo') {
      return { success: false, message: 'Conta inativa na coordenadoria. Entre em contato com o administrador.' };
    }

    const correctPassword = foundUser.password || 'Crateus@123';
    if (passwordInput !== correctPassword) {
      return { success: false, message: 'Senha incorreta. Tente novamente ou solicite o reset de senha ao administrador.' };
    }

    setState(prev => ({
      ...prev,
      currentUserId: foundUser.id,
      isLoggedIn: true
    }));

    return { success: true };
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      isLoggedIn: false
    }));
  };

  const resetUserPassword = (userId: string, newPassword?: string) => {
    const targetPassword = newPassword || 'Crateus@123';
    setState(prev => ({
      ...prev,
      teamUsers: (prev.teamUsers || initialTeamUsers).map(u => 
        u.id === userId ? { ...u, password: targetPassword } : u
      )
    }));
    return targetPassword;
  };

  const changeUserPassword = (userId: string, currentPass: string, newPass: string) => {
    const list = state.teamUsers || initialTeamUsers;
    const targetUser = list.find(u => u.id === userId);
    
    if (!targetUser) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const currentActualPass = targetUser.password || 'Crateus@123';
    if (currentPass !== currentActualPass) {
      return { success: false, message: 'A senha atual informada está incorreta.' };
    }

    if (!newPass || newPass.length < 4) {
      return { success: false, message: 'A nova senha deve possuir pelo menos 4 caracteres.' };
    }

    setState(prev => ({
      ...prev,
      teamUsers: (prev.teamUsers || initialTeamUsers).map(u => 
        u.id === userId ? { ...u, password: newPass } : u
      )
    }));

    return { success: true, message: 'Sua senha foi alterada com sucesso!' };
  };

  const updateUserProfile = (userId: string, name: string, roleTitle: string) => {
    setState(prev => {
      const currentList = prev.teamUsers || initialTeamUsers;
      const updatedList = currentList.map(u => u.id === userId ? { ...u, name, roleTitle } : u);
      const userToUpdate = currentList.find(u => u.id === userId);
      
      const updatedSettings = userToUpdate?.role === 'administrador' ? {
        ...(prev.systemSettings || defaultSystemSettings),
        coordinatorName: name,
        coordinatorRole: roleTitle
      } : prev.systemSettings;

      return {
        ...prev,
        teamUsers: updatedList,
        systemSettings: updatedSettings
      };
    });
  };

  const currentUser = (state.teamUsers || initialTeamUsers).find(u => u.id === state.currentUserId) || (state.teamUsers || initialTeamUsers)[0];

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setState(prev => {
      const newSettings = {
        ...defaultSystemSettings,
        ...(prev.systemSettings || {}),
        ...settings
      };

      const currentList = prev.teamUsers || initialTeamUsers;
      const updatedTeamUsers = currentList.map(u => {
        if (u.id === prev.currentUserId || u.role === 'administrador') {
          return {
            ...u,
            ...(settings.coordinatorName ? { name: settings.coordinatorName } : {}),
            ...(settings.coordinatorRole ? { roleTitle: settings.coordinatorRole } : {})
          };
        }
        return u;
      });

      return {
        ...prev,
        teamUsers: updatedTeamUsers,
        systemSettings: newSettings
      };
    });
  };

  const addTechnicalVisit = (visitData: Omit<TechnicalVisit, 'id'>) => {
    const newId = `v_${Date.now()}`;
    const newVisit: TechnicalVisit = { ...visitData, id: newId };
    
    setState(prev => {
      // If the visit is realized, update school status to "atendida"
      const updatedSchools = prev.schools.map(s => {
        if (s.id === visitData.schoolId) {
          const isRealized = visitData.status === 'realizada';
          const newVisitsCount = s.visitsCount + (isRealized ? 1 : 0);
          
          // Combine needs/recommendations if provided
          const updatedNeeds = Array.from(new Set([...s.needs, ...visitData.mainNeeds]));
          const updatedPendingActions = isRealized
            ? s.pendingActions.filter(act => !visitData.details.toLowerCase().includes(act.toLowerCase()))
            : s.pendingActions;

          return {
            ...s,
            visitsCount: newVisitsCount,
            lastVisitDate: isRealized ? visitData.date : s.lastVisitDate,
            needs: updatedNeeds,
            status: newVisitsCount > 0 ? 'atendida' as const : s.status,
            internetSpeedMbps: isRealized ? visitData.internetSpeed : s.internetSpeedMbps,
            pendingActions: updatedPendingActions
          };
        }
        return s;
      });

      return {
        ...prev,
        visits: [newVisit, ...prev.visits],
        schools: updatedSchools
      };
    });
  };

  const addSchool = (schoolData: School) => {
    setState(prev => ({
      ...prev,
      schools: [...prev.schools, schoolData]
    }));
  };

  const addSchoolsBulk = (newSchools: School[]) => {
    setState(prev => ({
      ...prev,
      schools: [...prev.schools, ...newSchools]
    }));
  };

  const deleteSchool = (schoolId: string) => {
    setState(prev => ({
      ...prev,
      schools: prev.schools.filter(s => s.id !== schoolId)
    }));
  };

  const deleteAllSchools = () => {
    setState(prev => ({
      ...prev,
      schools: []
    }));
  };

  const updateSchool = (updatedSchool: School) => {
    setState(prev => ({
      ...prev,
      schools: prev.schools.map(s => s.id === updatedSchool.id ? updatedSchool : s)
    }));
  };

  const ensureMicroactionsList = (action: WorkPlanAction): { id: string; title: string; completed: boolean }[] => {
    if (action.microactionsList && action.microactionsList.length > 0) {
      return action.microactionsList;
    }
    const count = Math.max(action.microactionsCount || 3, 1);
    const completedCount = Math.min(action.microactionsCompleted || 0, count);
    return Array.from({ length: count }, (_, idx) => ({
      id: `m_${action.id}_${idx + 1}`,
      title: idx < completedCount 
        ? `Etapa concluída: Verificação e execução do passo ${idx + 1}`
        : `Etapa pendente: Execução do passo operacional ${idx + 1}`,
      completed: idx < completedCount
    }));
  };

  const recalculateGoalStats = (goal: WorkPlanGoal, updatedActions: WorkPlanAction[]): WorkPlanGoal => {
    const totalActionPercent = updatedActions.reduce((acc, act) => acc + act.completionPercent, 0);
    const avgPercent = updatedActions.length > 0 ? Math.round(totalActionPercent / updatedActions.length) : 0;
    
    let goalStatus: WorkPlanGoal['status'] = goal.status;
    if (avgPercent >= 100) {
      goalStatus = 'concluido';
    } else if (avgPercent > 0) {
      goalStatus = 'em_andamento';
    } else {
      goalStatus = 'nao_iniciado';
    }

    const nowStr = '2026-07-10';
    const isAnyActionOverdue = updatedActions.some(act => act.status === 'atrasado' || (act.completionPercent < 100 && act.dueDate < nowStr));
    if (isAnyActionOverdue && goalStatus !== 'concluido') {
      goalStatus = 'atrasado';
    }

    const completedActionsCount = updatedActions.filter(act => act.status === 'concluido').length;

    return {
      ...goal,
      actions: updatedActions,
      currentValue: completedActionsCount,
      status: goalStatus
    };
  };

  const updateActionCompletion = (goalId: string, actionId: string, completionPercent: number) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(goal => {
        if (goal.id !== goalId) return goal;

        const updatedActions = goal.actions.map(action => {
          if (action.id !== actionId) return action;

          const updatedStatus = completionPercent >= 100 
            ? 'concluido' as const 
            : completionPercent > 0 
              ? 'em_andamento' as const 
              : 'nao_iniciado' as const;

          const currentList = ensureMicroactionsList(action);
          const updatedMicroCompleted = Math.round((completionPercent / 100) * currentList.length);

          const syncedList = currentList.map((m, idx) => ({
            ...m,
            completed: idx < updatedMicroCompleted
          }));

          return {
            ...action,
            completionPercent,
            status: updatedStatus,
            microactionsCount: syncedList.length,
            microactionsCompleted: updatedMicroCompleted,
            microactionsList: syncedList
          };
        });

        return recalculateGoalStats(goal, updatedActions);
      });

      return {
        ...prev,
        goals: updatedGoals
      };
    });
  };

  const addAction = (goalId: string, actionData: Omit<WorkPlanAction, 'id'>) => {
    const newId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newAction: WorkPlanAction = {
      ...actionData,
      id: newId,
      responsible: actionData.responsible || currentUser.name,
      responsibleId: actionData.responsibleId || currentUser.id,
      microactionsList: actionData.microactionsList || ensureMicroactionsList({ ...actionData, id: newId } as WorkPlanAction)
    };
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id !== goalId) return goal;
        return recalculateGoalStats(goal, [...goal.actions, newAction]);
      })
    }));
  };

  const updateAction = (goalId: string, actionId: string, updatedData: Partial<WorkPlanAction>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id !== goalId) return goal;
        const updatedActions = goal.actions.map(action => {
          if (action.id !== actionId) return action;
          const merged = { ...action, ...updatedData };
          if (updatedData.completionPercent !== undefined) {
            merged.status = merged.completionPercent >= 100 
              ? 'concluido' 
              : merged.completionPercent > 0 
                ? 'em_andamento' 
                : 'nao_iniciado';
          }
          if (merged.microactionsList) {
            merged.microactionsCount = merged.microactionsList.length;
            merged.microactionsCompleted = merged.microactionsList.filter(m => m.completed).length;
          }
          return merged;
        });
        return recalculateGoalStats(goal, updatedActions);
      })
    }));
  };

  const deleteAction = (goalId: string, actionId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id !== goalId) return goal;
        const updatedActions = goal.actions.filter(action => action.id !== actionId);
        return recalculateGoalStats(goal, updatedActions);
      })
    }));
  };

  const addMicroaction = (goalId: string, actionId: string, title: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id !== goalId) return goal;
        const updatedActions = goal.actions.map(action => {
          if (action.id !== actionId) return action;
          const currentList = ensureMicroactionsList(action);
          const newMicro = { id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, title, completed: false };
          const newList = [...currentList, newMicro];
          const microactionsCount = newList.length;
          const microactionsCompleted = newList.filter(m => m.completed).length;
          const completionPercent = Math.round((microactionsCompleted / microactionsCount) * 100);
          const status = completionPercent >= 100 ? 'concluido' : completionPercent > 0 ? 'em_andamento' : 'nao_iniciado';
          return {
            ...action,
            microactionsList: newList,
            microactionsCount,
            microactionsCompleted,
            completionPercent,
            status
          };
        });
        return recalculateGoalStats(goal, updatedActions);
      })
    }));
  };

  const toggleMicroaction = (goalId: string, actionId: string, microactionId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id !== goalId) return goal;
        const updatedActions = goal.actions.map(action => {
          if (action.id !== actionId) return action;
          const currentList = ensureMicroactionsList(action);
          const newList = currentList.map(m => m.id === microactionId ? { ...m, completed: !m.completed } : m);
          const microactionsCount = newList.length;
          const microactionsCompleted = newList.filter(m => m.completed).length;
          const completionPercent = Math.round((microactionsCompleted / microactionsCount) * 100);
          const status = completionPercent >= 100 ? 'concluido' : completionPercent > 0 ? 'em_andamento' : 'nao_iniciado';
          return {
            ...action,
            microactionsList: newList,
            microactionsCount,
            microactionsCompleted,
            completionPercent,
            status
          };
        });
        return recalculateGoalStats(goal, updatedActions);
      })
    }));
  };

  const deleteMicroaction = (goalId: string, actionId: string, microactionId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id !== goalId) return goal;
        const updatedActions = goal.actions.map(action => {
          if (action.id !== actionId) return action;
          const currentList = ensureMicroactionsList(action);
          const newList = currentList.filter(m => m.id !== microactionId);
          const microactionsCount = Math.max(newList.length, 1);
          const microactionsCompleted = newList.filter(m => m.completed).length;
          const completionPercent = newList.length === 0 ? 0 : Math.round((microactionsCompleted / microactionsCount) * 100);
          const status = completionPercent >= 100 ? 'concluido' : completionPercent > 0 ? 'em_andamento' : 'nao_iniciado';
          return {
            ...action,
            microactionsList: newList,
            microactionsCount: newList.length,
            microactionsCompleted,
            completionPercent,
            status
          };
        });
        return recalculateGoalStats(goal, updatedActions);
      })
    }));
  };

  const updateTechnicalVisit = (visitId: string, updatedData: Partial<TechnicalVisit>) => {
    setState(prev => ({
      ...prev,
      visits: prev.visits.map(v => v.id === visitId ? { ...v, ...updatedData } : v)
    }));
  };

  const deleteTechnicalVisit = (visitId: string) => {
    setState(prev => ({
      ...prev,
      visits: prev.visits.filter(v => v.id !== visitId)
    }));
  };

  const addFormation = (formationData: Omit<Formation, 'id'>) => {
    const newId = `f_${Date.now()}`;
    const newFormation: Formation = { ...formationData, id: newId };
    setState(prev => ({
      ...prev,
      formations: [newFormation, ...prev.formations]
    }));
  };

  const updateFormation = (formationId: string, updatedData: Partial<Formation>) => {
    setState(prev => ({
      ...prev,
      formations: prev.formations.map(f => f.id === formationId ? { ...f, ...updatedData } : f)
    }));
  };

  const deleteFormation = (formationId: string) => {
    setState(prev => ({
      ...prev,
      formations: prev.formations.filter(f => f.id !== formationId)
    }));
  };

  const addScienceFair = (fairData: Omit<ScienceFair, 'id'>) => {
    const newId = `fr_${Date.now()}`;
    const school = state.schools.find(s => s.id === fairData.schoolId);
    const newFair: ScienceFair = {
      ...fairData,
      id: newId,
      schoolName: school ? school.name : 'Escola Externa'
    };
    setState(prev => ({
      ...prev,
      fairs: [newFair, ...prev.fairs]
    }));
  };

  const updateScienceFair = (fairId: string, updatedData: Partial<ScienceFair>) => {
    setState(prev => ({
      ...prev,
      fairs: prev.fairs.map(fr => {
        if (fr.id !== fairId) return fr;
        const school = updatedData.schoolId ? prev.schools.find(s => s.id === updatedData.schoolId) : null;
        return {
          ...fr,
          ...updatedData,
          schoolName: school ? school.name : (updatedData.schoolName || fr.schoolName)
        };
      })
    }));
  };

  const deleteScienceFair = (fairId: string) => {
    setState(prev => ({
      ...prev,
      fairs: prev.fairs.filter(fr => fr.id !== fairId)
    }));
  };

  const addGoal = (goalData: Omit<WorkPlanGoal, 'id' | 'actions'> & { actions: Omit<WorkPlanGoal['actions'][0], 'id'>[] }) => {
    const goalId = `g_${Date.now()}`;
    const actionsWithIds = goalData.actions.map((act, i) => ({
      ...act,
      id: `a_${goalId}_${i}`,
      goalId
    })) as WorkPlanGoal['actions'];

    const newGoal: WorkPlanGoal = {
      ...goalData,
      id: goalId,
      actions: actionsWithIds
    };

    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (goalId: string, updatedData: Partial<WorkPlanGoal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === goalId ? recalculateGoalStats({ ...g, ...updatedData }, g.actions) : g)
    }));
  };

  const deleteGoal = (goalId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId)
    }));
  };

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newId = `p_${Date.now()}`;
    const newProject: Project = { ...projectData, id: newId };
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (projectId: string, updatedData: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, ...updatedData } : p)
    }));
  };

  const deleteProject = (projectId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId)
    }));
  };

  const setActiveTab = (tab: StrategicState['activeTab'], subTab?: string) => {
    setState(prev => ({ 
      ...prev, 
      activeTab: tab,
      activeSubTab: subTab !== undefined ? subTab : prev.activeSubTab
    }));
  };

  const resetData = () => {
    setState({
      schools: initialSchools,
      goals: initialGoals,
      projects: initialProjects,
      visits: initialVisits,
      formations: initialFormations,
      fairs: initialFairs,
      activeTab: 'dashboard'
    });
  };

  // Google Drive Sync States & Ref
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [user, setUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [lastDriveSync, setLastDriveSync] = useState<string | null>(() => localStorage.getItem('crateus_last_drive_sync'));
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('crateus_auto_sync');
    return saved === null ? true : saved === 'true';
  });

  const setAutoSyncEnabled = (enabled: boolean) => {
    setAutoSyncEnabledState(enabled);
    localStorage.setItem('crateus_auto_sync', String(enabled));
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setDriveToken(token);
        // Automatically enable auto-sync when Google user is logged in
        if (localStorage.getItem('crateus_auto_sync') !== 'false') {
          setAutoSyncEnabledState(true);
          localStorage.setItem('crateus_auto_sync', 'true');
        }
      },
      () => {
        setUser(null);
        setDriveToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const connectToDrive = async () => {
    try {
      setIsSyncingDrive(true);
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setDriveToken(result.accessToken);
        setAutoSyncEnabled(true);
      }
    } catch (err: any) {
      console.error('Falha ao conectar no Drive:', err);
      alert(`Erro ao conectar com Google Drive: ${err.message || 'Verifique se os popups não foram bloqueados.'}`);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const disconnectFromDrive = async () => {
    await logoutGoogle();
    setUser(null);
    setDriveToken(null);
    setAutoSyncEnabled(false);
  };

  const saveToDriveNow = async (silent = false): Promise<boolean> => {
    if (!driveToken) {
      if (!silent) alert('Por favor, conecte-se ao Google Drive primeiro.');
      return false;
    }
    try {
      setIsSyncingDrive(true);
      await saveToGoogleDrive(driveToken, stateRef.current);
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + new Date().toLocaleDateString('pt-BR') + ')';
      setLastDriveSync(now);
      localStorage.setItem('crateus_last_drive_sync', now);
      if (!silent) {
        alert('✅ Backup salvo com sucesso no seu Google Drive!');
      }
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar no Drive:', err);
      if (!silent) {
        alert(`❌ Erro ao salvar no Google Drive: ${err.message || 'Tente reconectar sua conta.'}`);
      }
      return false;
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const loadFromDriveNow = async (): Promise<boolean> => {
    if (!driveToken) {
      alert('Por favor, conecte-se ao Google Drive primeiro.');
      return false;
    }
    try {
      setIsSyncingDrive(true);
      const fileInfo = await searchBackupFile(driveToken);
      if (!fileInfo) {
        alert('⚠️ Nenhum arquivo de backup "crateus_gestao_estrategica_backup.json" foi encontrado no seu Google Drive.');
        return false;
      }
      const restoredState = await loadFromGoogleDrive(driveToken, fileInfo.id);
      if (restoredState && restoredState.schools && restoredState.goals) {
        setState({
          ...restoredState,
          activeTab: state.activeTab
        });
        const now = new Date().toLocaleTimeString('pt-BR') + ' (' + new Date().toLocaleDateString('pt-BR') + ')';
        setLastDriveSync(now);
        localStorage.setItem('crateus_last_drive_sync', now);
        alert('🔄 Dados restaurados com sucesso do seu Google Drive!');
        return true;
      } else {
        alert('⚠️ O arquivo de backup no Google Drive parece estar inválido ou corrompido.');
        return false;
      }
    } catch (err: any) {
      console.error('Erro ao restaurar do Drive:', err);
      alert(`❌ Erro ao restaurar do Google Drive: ${err.message || 'Tente reconectar sua conta.'}`);
      return false;
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Auto sync when state changes if autoSyncEnabled is true
  useEffect(() => {
    if (!autoSyncEnabled || !driveToken) return;
    const timer = setTimeout(() => {
      saveToDriveNow(true);
    }, 4000); // 4-second debounce
    return () => clearTimeout(timer);
  }, [state, autoSyncEnabled, driveToken]);

  // Hook into window close / visibility change to ensure latest save
  useEffect(() => {
    if (!autoSyncEnabled || !driveToken) return;
    const handleBeforeUnload = () => {
      saveToDriveNow(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveToDriveNow(true);
      }
    });
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSyncEnabled, driveToken]);

  // GitHub Sync State
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);

  const updateGitHubConfig = (newConfig: Partial<GitHubConfig>) => {
    setState(prev => ({
      ...prev,
      githubConfig: {
        ...(prev.githubConfig || {}),
        ...newConfig
      }
    }));
  };

  const syncWithGitHubNow = async (silent = false): Promise<boolean> => {
    const config = stateRef.current.githubConfig;
    if (!config || !config.repo || !config.token) {
      if (!silent) {
        alert('Configure o Repositório do GitHub e o Token de Acesso (PAT) para sincronizar.');
      }
      return false;
    }

    try {
      setIsSyncingGitHub(true);
      const result = await saveStateToGitHub(config, stateRef.current);
      if (result.success) {
        setState(prev => ({
          ...prev,
          githubConfig: {
            ...(prev.githubConfig || {}),
            lastSync: result.timestamp,
            lastStatus: 'success'
          }
        }));
        if (!silent) {
          alert('✅ Base de dados salva com sucesso no GitHub!');
        }
        return true;
      } else {
        setState(prev => ({
          ...prev,
          githubConfig: {
            ...(prev.githubConfig || {}),
            lastStatus: 'error'
          }
        }));
        if (!silent) {
          alert(`❌ ${result.message}`);
        }
        return false;
      }
    } catch (err: any) {
      if (!silent) {
        alert(`❌ Erro ao salvar no GitHub: ${err.message}`);
      }
      return false;
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const loadFromGitHubNow = async (): Promise<boolean> => {
    const config = stateRef.current.githubConfig;
    if (!config || !config.repo) {
      alert('Informe o repositório do GitHub (ex: usuario/repositorio) nas configurações para carregar.');
      return false;
    }

    try {
      setIsSyncingGitHub(true);
      const result = await loadStateFromGitHub(config);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          ...(result.data as Partial<StrategicState>),
          activeTab: prev.activeTab,
          isLoggedIn: prev.isLoggedIn,
          githubConfig: {
            ...(prev.githubConfig || {}),
            lastSync: new Date().toLocaleTimeString('pt-BR') + ' (' + new Date().toLocaleDateString('pt-BR') + ')',
            lastStatus: 'success'
          }
        }));
        alert('🔄 Base de dados carregada com sucesso do GitHub! Seus dados foram atualizados.');
        return true;
      } else {
        alert(`❌ ${result.message}`);
        return false;
      }
    } catch (err: any) {
      alert(`❌ Erro ao carregar do GitHub: ${err.message}`);
      return false;
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const exportLocalJson = () => {
    downloadLocalJsonBackup(stateRef.current, `crateus_gestao_base_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const importLocalJson = async (file: File): Promise<boolean> => {
    try {
      const data = await readJsonBackupFile(file);
      if (data && (data.schools || data.goals || data.projects)) {
        setState(prev => ({
          ...prev,
          ...(data as Partial<StrategicState>),
          activeTab: prev.activeTab,
          isLoggedIn: prev.isLoggedIn
        }));
        alert('✅ Arquivo de backup restaurado com sucesso! Todos os dados foram atualizados.');
        return true;
      } else {
        alert('⚠️ O arquivo JSON selecionado não possui a estrutura da plataforma de gestão.');
        return false;
      }
    } catch (err: any) {
      alert(`❌ Erro ao importar arquivo: ${err.message}`);
      return false;
    }
  };

  // GitHub Auto-Sync debounced
  useEffect(() => {
    if (!state.githubConfig?.autoSync || !state.githubConfig?.token || !state.githubConfig?.repo) return;
    const timer = setTimeout(() => {
      syncWithGitHubNow(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [state.schools, state.goals, state.projects, state.visits, state.formations, state.fairs, state.teamUsers, state.githubConfig?.autoSync]);

  return (
    <StateContext.Provider value={{
      state,
      currentUser,
      updateSystemSettings,
      addTeamUser,
      updateTeamUser,
      deleteTeamUser,
      setCurrentUserId,
      updateUserProfile,
      loginWithPassword,
      logout,
      resetUserPassword,
      changeUserPassword,
      addTechnicalVisit,
      updateTechnicalVisit,
      deleteTechnicalVisit,
      addSchool,
      addSchoolsBulk,
      deleteSchool,
      deleteAllSchools,
      updateSchool,
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
      setActiveTab,
      resetData,
      user,
      driveToken,
      isDriveConnected: !!driveToken,
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
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStrategicState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStrategicState must be used within a StateProvider');
  }
  return context;
};
