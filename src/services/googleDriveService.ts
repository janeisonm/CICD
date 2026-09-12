import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StrategicState } from '../types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const BACKUP_FILE_NAME = 'crateus_gestao_estrategica_backup.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime?: string;
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter token de acesso do Google Auth. Verifique os popups.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro no login com Google Drive:', error);
    if (error.code === 'auth/unauthorized-domain') {
      const currentHost = window.location.hostname;
      throw new Error(
        `Domínio não autorizado pelo Firebase (${currentHost}). ` +
        `Para usar a Google no GitHub Pages, acesse o Console do Firebase (Authentication > Configurações > Domínios Autorizados) ` +
        `e adicione "${currentHost}". Enquanto isso, utilize o Backup Local em Arquivo JSON ou a Sincronização com o GitHub!`
      );
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('O navegador bloqueou a janela pop-up do Google. Por favor, libere os pop-ups para este site.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('A janela de login do Google foi fechada antes da confirmação.');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const searchBackupFile = async (accessToken: string): Promise<DriveFileInfo | null> => {
  try {
    const query = encodeURIComponent(`name = '${BACKUP_FILE_NAME}' and trashed = false`);
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Erro na busca do Google Drive: ${err.error?.message || response.statusText}`);
    }
    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar arquivo de backup no Drive:', error);
    throw error;
  }
};

export const saveToGoogleDrive = async (accessToken: string, data: StrategicState): Promise<DriveFileInfo> => {
  // Check if file already exists
  let fileInfo = await searchBackupFile(accessToken);

  if (!fileInfo) {
    // Step 1: Create metadata
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: BACKUP_FILE_NAME,
        mimeType: 'application/json',
      }),
    });
    if (!createRes.ok) {
      const errData = await createRes.json();
      throw new Error(`Erro ao criar arquivo no Drive: ${errData.error?.message || createRes.statusText}`);
    }
    fileInfo = await createRes.json();
  }

  // Step 2: Upload or update content via PATCH media
  const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileInfo!.id}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data, null, 2),
  });

  if (!uploadRes.ok) {
    const errData = await uploadRes.json();
    throw new Error(`Erro ao salvar dados no Drive: ${errData.error?.message || uploadRes.statusText}`);
  }

  const updatedFileInfo = await uploadRes.json();
  return {
    id: updatedFileInfo.id || fileInfo!.id,
    name: BACKUP_FILE_NAME,
    modifiedTime: new Date().toISOString()
  };
};

export const loadFromGoogleDrive = async (accessToken: string, fileId: string): Promise<StrategicState> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Erro ao baixar backup do Google Drive: ${response.statusText}`);
  }
  const data = await response.json();
  return data as StrategicState;
};
