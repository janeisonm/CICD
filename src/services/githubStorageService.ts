import { GitHubConfig, StrategicState } from '../types';

export const GITHUB_DEFAULT_PATH = 'data/database.json';
export const GITHUB_DEFAULT_BRANCH = 'main';

// Helper for UTF-8 Base64 encoding in browser
function toBase64Utf8(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

// Helper for UTF-8 Base64 decoding in browser
function fromBase64Utf8(base64: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(base64.replace(/\s/g, '')), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

export interface GitHubSyncResult {
  success: boolean;
  message: string;
  timestamp?: string;
  sha?: string;
}

/**
 * Saves the entire application state directly into the user's GitHub Repository
 */
export async function saveStateToGitHub(
  config: GitHubConfig,
  state: StrategicState
): Promise<GitHubSyncResult> {
  const token = config.token?.trim();
  const repo = config.repo?.trim(); // Format: owner/repo
  const branch = config.branch?.trim() || GITHUB_DEFAULT_BRANCH;
  const path = config.path?.trim() || GITHUB_DEFAULT_PATH;

  if (!token || !repo) {
    return {
      success: false,
      message: 'Token de Acesso Pessoal (PAT) e Repositório (usuario/repo) são obrigatórios.',
    };
  }

  try {
    const cleanRepo = repo.replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
    const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${path}`;

    // Step 1: Check if file already exists to obtain its current SHA
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (getRes.ok) {
        const fileData = await getRes.json();
        existingSha = fileData.sha;
      }
    } catch {
      // File might not exist yet, which is fine
    }

    // Step 2: Prepare clean state to save (exclude transient session tokens)
    const stateToSave = {
      schools: state.schools,
      goals: state.goals,
      projects: state.projects,
      visits: state.visits,
      formations: state.formations,
      fairs: state.fairs,
      teamUsers: state.teamUsers,
      systemSettings: state.systemSettings,
      activeTab: state.activeTab,
      lastUpdated: new Date().toISOString(),
      updatedBy: state.currentUserId,
    };

    const jsonString = JSON.stringify(stateToSave, null, 2);
    const contentBase64 = toBase64Utf8(jsonString);

    // Step 3: Commit / Push to GitHub repository via PUT
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `chore(data): sincronização da base de gestão estratégica [${new Date().toLocaleString('pt-BR')}]`,
        content: contentBase64,
        branch: branch,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      let msg = errData.message || putRes.statusText;
      if (putRes.status === 401) {
        msg = 'Token de acesso inválido ou expirado. Gere um novo token no GitHub com permissão "repo" ou "contents:write".';
      } else if (putRes.status === 404) {
        msg = `Repositório "${cleanRepo}" ou branch "${branch}" não encontrado. Verifique se o nome está correto.`;
      }
      return { success: false, message: `Erro GitHub (${putRes.status}): ${msg}` };
    }

    const resData = await putRes.json();
    const now = new Date().toLocaleTimeString('pt-BR') + ' (' + new Date().toLocaleDateString('pt-BR') + ')';

    return {
      success: true,
      message: 'Base de dados sincronizada com sucesso no GitHub!',
      timestamp: now,
      sha: resData.content?.sha,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na conexão com GitHub: ${err.message || 'Erro desconhecido'}`,
    };
  }
}

/**
 * Loads the latest state from the user's GitHub Repository
 */
export async function loadStateFromGitHub(
  config: GitHubConfig
): Promise<{ success: boolean; data?: Partial<StrategicState>; message: string }> {
  const token = config.token?.trim();
  const repo = config.repo?.trim();
  const branch = config.branch?.trim() || GITHUB_DEFAULT_BRANCH;
  const path = config.path?.trim() || GITHUB_DEFAULT_PATH;

  if (!repo) {
    return { success: false, message: 'Repositório não configurado.' };
  }

  const cleanRepo = repo.replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const apiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${path}?ref=${branch}`;
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      // Fallback: try raw content url if public repo
      const rawUrl = `https://raw.githubusercontent.com/${cleanRepo}/${branch}/${path}?t=${Date.now()}`;
      const rawRes = await fetch(rawUrl);
      if (rawRes.ok) {
        const rawJson = await rawRes.json();
        return {
          success: true,
          data: rawJson,
          message: 'Dados carregados com sucesso do GitHub!',
        };
      }

      return {
        success: false,
        message: `Arquivo "${path}" não encontrado no repositório "${cleanRepo}" (branch "${branch}").`,
      };
    }

    const fileData = await response.json();
    if (!fileData.content) {
      return { success: false, message: 'Arquivo vazio no GitHub.' };
    }

    const decoded = fromBase64Utf8(fileData.content);
    const parsed = JSON.parse(decoded);

    return {
      success: true,
      data: parsed,
      message: 'Base de dados restaurada com sucesso do GitHub!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao carregar dados do GitHub: ${err.message || 'Falha de conexão'}`,
    };
  }
}

/**
 * Download state directly as JSON file for manual backup or manual GitHub commit
 */
export function downloadLocalJsonBackup(state: StrategicState, filename = 'crateus_gestao_estrategica_base.json') {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse uploaded JSON backup file
 */
export async function readJsonBackupFile(file: File): Promise<Partial<StrategicState>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        resolve(parsed);
      } catch (err) {
        reject(new Error('O arquivo selecionado não é um arquivo JSON válido.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo do seu computador.'));
    reader.readAsText(file);
  });
}
