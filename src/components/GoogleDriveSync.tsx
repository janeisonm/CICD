import React, { useState, useRef } from 'react';
import { useStrategicState } from '../stateContext';
import { 
  Cloud, CloudUpload, CloudDownload, RefreshCw, CheckCircle, 
  Settings, LogOut, ShieldCheck, Zap, X, AlertTriangle, Database,
  GitBranch, Github, FileDown, FileUp, Info, ExternalLink, KeyRound
} from 'lucide-react';

export const GoogleDriveBanner: React.FC = () => {
  const { 
    state,
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
    // GitHub
    isSyncingGitHub,
    updateGitHubConfig,
    syncWithGitHubNow,
    loadFromGitHubNow,
    exportLocalJson,
    importLocalJson
  } = useStrategicState();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub local form state
  const githubConfig = state.githubConfig || {
    repo: '',
    token: '',
    branch: 'main',
    path: 'data/database.json',
    autoSync: false,
  };
  const [ghRepo, setGhRepo] = useState(githubConfig.repo || '');
  const [ghToken, setGhToken] = useState(githubConfig.token || '');
  const [ghBranch, setGhBranch] = useState(githubConfig.branch || 'main');
  const [ghAutoSync, setGhAutoSync] = useState(githubConfig.autoSync || false);

  const handleConnectDrive = async () => {
    setDriveError(null);
    try {
      await connectToDrive();
    } catch (err: any) {
      setDriveError(err.message || 'Falha ao conectar com o Google Drive');
    }
  };

  const handleToggleAutoSync = () => {
    if (!autoSyncEnabled) {
      const confirmed = window.confirm(
        'Ativar Sincronização Automática com o Google Drive?\n\n' +
        'O arquivo "crateus_gestao_estrategica_backup.json" no seu Drive será atualizado automaticamente ao realizar alterações.\n\n' +
        'Deseja ativar?'
      );
      if (confirmed) {
        setAutoSyncEnabled(true);
        saveToDriveNow(true);
      }
    } else {
      setAutoSyncEnabled(false);
    }
  };

  const handleSaveGitHubSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateGitHubConfig({
      repo: ghRepo.trim(),
      token: ghToken.trim(),
      branch: ghBranch.trim() || 'main',
      autoSync: ghAutoSync,
    });
    setShowGitHubModal(false);
    alert('Configurações do GitHub salvas com sucesso!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importLocalJson(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isGitHubConfigured = !!(githubConfig.repo && githubConfig.token);

  return (
    <>
      {/* Hidden file input for manual JSON restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".json" 
        className="hidden" 
        id="backup-file-importer"
      />

      {/* PERSISTENCE & BACKUP HUB CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-slate-800 mb-6 transition-all duration-300" id="persistence-hub-banner">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* LEFT: STATUS & EXPLANATION */}
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5 shadow-inner">
              <Database className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Persistência & Backup de Dados
                </span>
                
                {isGitHubConfigured && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                    <Github className="h-3 w-3" /> Base GitHub Ativa
                  </span>
                )}

                {isDriveConnected && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                    <Cloud className="h-3 w-3" /> Google Drive Conectado
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Seus dados salvos e sincronizados para continuar de onde parou
              </h3>
              
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                As alterações realizadas ficam gravadas no navegador localmente e podem ser sincronizadas com a <strong>Base do GitHub</strong>, <strong>Google Drive</strong> ou baixadas em <strong>Arquivo (.json)</strong>.
              </p>

              {(githubConfig.lastSync || lastDriveSync) && (
                <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                  {githubConfig.lastSync && (
                    <span>GitHub: <strong className="text-purple-300 font-mono">{githubConfig.lastSync}</strong></span>
                  )}
                  {lastDriveSync && (
                    <span>Drive: <strong className="text-blue-300 font-mono">{lastDriveSync}</strong></span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTION BUTTONS (GITHUB, DRIVE, JSON FILE) */}
          <div className="flex items-center gap-2 flex-wrap xl:shrink-0">
            
            {/* 1. GITHUB SYNC BUTTON */}
            {isGitHubConfigured ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-purple-500/40 rounded-2xl p-1 shadow-sm">
                <button
                  onClick={() => syncWithGitHubNow(false)}
                  disabled={isSyncingGitHub}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  title="Salvar alterações na base do repositório GitHub"
                  id="btn-sync-github-now"
                >
                  <Github className={`h-3.5 w-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                  <span>{isSyncingGitHub ? 'Salvando...' : 'Salvar no GitHub'}</span>
                </button>
                <button
                  onClick={() => loadFromGitHubNow()}
                  disabled={isSyncingGitHub}
                  className="flex items-center gap-1 px-2.5 py-2 hover:bg-slate-800 text-purple-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Recarregar dados mais recentes do repositório GitHub"
                  id="btn-load-github-now"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowGitHubModal(true)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Configurações do GitHub"
                  id="btn-config-github"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowGitHubModal(true)}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-purple-200 border border-purple-500/30 font-bold px-3.5 py-2 rounded-2xl text-xs transition-all cursor-pointer shadow-sm hover:border-purple-400"
                id="btn-open-github-modal"
              >
                <Github className="h-4 w-4 text-purple-400" />
                <span>Conectar Base GitHub</span>
              </button>
            )}

            {/* 2. GOOGLE DRIVE BUTTON */}
            {isDriveConnected ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-blue-500/40 rounded-2xl p-1 shadow-sm">
                <button
                  onClick={() => saveToDriveNow(false)}
                  disabled={isSyncingDrive}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  title="Salvar backup no Google Drive"
                  id="btn-save-drive-now"
                >
                  <CloudUpload className={`h-3.5 w-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                  <span>{isSyncingDrive ? 'Salvando...' : 'Salvar no Drive'}</span>
                </button>
                <button
                  onClick={() => loadFromDriveNow()}
                  disabled={isSyncingDrive}
                  className="flex items-center gap-1 px-2.5 py-2 hover:bg-slate-800 text-blue-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Restaurar backup do Google Drive"
                  id="btn-restore-drive-now"
                >
                  <CloudDownload className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Opções do Google Drive"
                  id="btn-config-drive"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectDrive}
                disabled={isSyncingDrive}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-blue-200 border border-blue-500/30 font-bold px-3.5 py-2 rounded-2xl text-xs transition-all cursor-pointer shadow-sm hover:border-blue-400 disabled:opacity-50"
                id="btn-connect-google-drive"
              >
                <Cloud className="h-4 w-4 text-blue-400" />
                <span>{isSyncingDrive ? 'Conectando...' : 'Google Drive'}</span>
              </button>
            )}

            {/* 3. DIRECT FILE BACKUP (.JSON) BUTTONS */}
            <div className="flex items-center gap-1">
              <button
                onClick={exportLocalJson}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer border border-emerald-500/40 shadow-sm"
                title="Baixar arquivo de backup JSON no computador"
                id="btn-download-json-backup"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Baixar Backup (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl text-xs transition-colors cursor-pointer border border-slate-700 shadow-sm"
                title="Restaurar backup a partir de um arquivo JSON do seu computador"
                id="btn-restore-json-backup"
              >
                <FileUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Restaurar</span>
              </button>
            </div>

          </div>
        </div>

        {/* GOOGLE DRIVE GITHUB PAGES DOMAIN WARNING (IF OCCURRED) */}
        {driveError && (
          <div className="mt-4 p-3.5 bg-rose-950/80 border border-rose-600/50 rounded-2xl text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in" id="drive-error-alert">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-white">Aviso sobre conexão com o Google Drive no GitHub Pages:</p>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">{driveError}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDomainHelp(!showDomainHelp)}
              className="text-[11px] font-bold text-white bg-rose-800 hover:bg-rose-700 px-3 py-1.5 rounded-xl shrink-0 cursor-pointer transition-colors"
            >
              {showDomainHelp ? 'Ocultar Instruções' : 'Como Autorizar no Firebase'}
            </button>
          </div>
        )}

        {/* EXPANDABLE INSTRUCTIONS FOR FIREBASE DOMAIN AUTHORIZATION */}
        {showDomainHelp && (
          <div className="mt-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-2 animate-fade-in" id="firebase-domain-help">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              Liberar o Google Drive no GitHub Pages:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Acesse o <strong>Firebase Console</strong> (<a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="h-3 w-3 inline" /></a>).</li>
              <li>Entre no projeto <strong>absolute-aloe-57c1c</strong> (ou no seu projeto configurado).</li>
              <li>Vá em <strong>Authentication &gt; Configurações (Settings) &gt; Domínios Autorizados</strong>.</li>
              <li>Clique em <strong>Adicionar Domínio</strong> e insira o domínio do seu GitHub Pages: <code className="bg-slate-800 text-yellow-300 px-1 py-0.5 rounded font-mono">{window.location.hostname}</code>.</li>
              <li>Pronto! O popup do Google Drive funcionará sem bloqueios no GitHub Pages.</li>
            </ol>
            <div className="pt-1 text-[11px] text-emerald-400 font-medium">
              💡 <strong>Dica:</strong> Você também pode usar a <strong>Base do GitHub</strong> ou o <strong>Backup em Arquivo (.json)</strong> acima, que funcionam imediatamente sem precisar alterar o Firebase!
            </div>
          </div>
        )}

      </div>

      {/* GITHUB SYNC CONFIGURATION MODAL */}
      {showGitHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in" id="modal-github-config">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Sincronização com a Base do GitHub</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Salve os dados diretamente no repositório GitHub</p>
                </div>
              </div>
              <button
                onClick={() => setShowGitHubModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGitHubSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Repositório GitHub (usuario/repositorio)
                </label>
                <input
                  type="text"
                  required
                  value={ghRepo}
                  onChange={(e) => setGhRepo(e.target.value)}
                  placeholder="Ex: janeison-trabalho/plano-gestao-crateus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  id="input-gh-repo"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  O repositório onde o arquivo de banco de dados (<code className="text-purple-300 font-mono">data/database.json</code>) será gravado.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>GitHub Personal Access Token (PAT)</span>
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-purple-400 hover:underline text-[10px] flex items-center gap-1 font-semibold"
                  >
                    Gerar Token no GitHub <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                    id="input-gh-token"
                  />
                  <KeyRound className="h-4 w-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Token com permissão <strong className="text-purple-300">repo</strong> (ou Fine-grained com <strong className="text-purple-300">Contents: Read &amp; Write</strong>). O token é mantido estritamente seguro no seu navegador.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={ghBranch}
                    onChange={(e) => setGhBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                    id="input-gh-branch"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ghAutoSync}
                      onChange={(e) => setGhAutoSync(e.target.checked)}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      id="checkbox-gh-autosync"
                    />
                    <span className="text-xs font-bold text-slate-200">Sincronização Automática</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-[11px] text-purple-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-white">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  Como funciona no GitHub Pages:
                </p>
                <p className="leading-relaxed">
                  Toda vez que você cadastrar metas, escolas ou relatórios, a aplicação envia um commit atualizando a base no repositório. Assim, ao abrir o site de qualquer computador, os dados continuam exatamente de onde você parou!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGitHubModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-colors"
                  id="btn-save-gh-settings"
                >
                  Salvar Configuração
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* GOOGLE DRIVE SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in" id="modal-drive-settings">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-400" />
                <h3 className="font-extrabold text-base text-white">Configurações do Google Drive</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Sincronização Automática</span>
                  <button
                    onClick={handleToggleAutoSync}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Quando ativo, o arquivo <strong className="text-blue-300 font-mono text-[10px]">crateus_gestao_estrategica_backup.json</strong> no seu Drive é atualizado em segundo plano.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (window.confirm('Deseja realmente desconectar a conta do Google Drive?')) {
                      disconnectFromDrive();
                      setShowSettingsModal(false);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-2 rounded-xl hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Desconectar Conta</span>
                </button>

                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-700 transition-colors"
                >
                  Concluído
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
