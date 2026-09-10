import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { 
  Cloud, CloudUpload, CloudDownload, RefreshCw, CheckCircle, 
  Settings, LogOut, ShieldCheck, Zap, X, AlertTriangle, Database 
} from 'lucide-react';

export const GoogleDriveBanner: React.FC = () => {
  const { 
    user, 
    isDriveConnected, 
    isSyncingDrive, 
    lastDriveSync, 
    autoSyncEnabled, 
    setAutoSyncEnabled, 
    connectToDrive, 
    disconnectFromDrive, 
    saveToDriveNow, 
    loadFromDriveNow 
  } = useStrategicState();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);
  const [showConfirmRestoreModal, setShowConfirmRestoreModal] = useState(false);

  const handleToggleAutoSync = () => {
    if (!autoSyncEnabled) {
      const confirmed = window.confirm(
        'Ativar Sincronização Automática?\n\n' +
        'O arquivo de backup "crateus_gestao_estrategica_backup.json" no seu Google Drive será automaticamente atualizado e sobrescrito sempre que você modificar metas, escolas ou sair/fechar a janela da plataforma.\n\n' +
        'Confirma a ativação?'
      );
      if (confirmed) {
        setAutoSyncEnabled(true);
        // Trigger an immediate initial save
        saveToDriveNow(true);
      }
    } else {
      setAutoSyncEnabled(false);
    }
  };

  const handleConfirmManualSave = async () => {
    setShowConfirmSaveModal(false);
    await saveToDriveNow(false);
  };

  const handleConfirmManualRestore = async () => {
    setShowConfirmRestoreModal(false);
    await loadFromDriveNow();
  };

  if (!isDriveConnected) {
    return (
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-800/40 mb-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-300 shrink-0 mt-0.5">
              <Cloud className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Proteção e Nuvem
                </span>
                <span className="text-xs font-semibold text-blue-200">Google Workspace API</span>
              </div>
              <h3 className="font-bold text-base text-white mt-1">Sincronize com o Google Drive para não perder seus dados</h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Conecte sua conta para que todos os seus relatórios, metas do plano de trabalho e inventários fiquem salvos automaticamente no seu Google Drive (arquivo <code className="bg-slate-800/80 px-1 py-0.5 rounded text-yellow-300 font-mono">crateus_gestao_estrategica_backup.json</code>). Assim, seus dados continuam seguros mesmo que você saia ou feche a janela.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={connectToDrive}
              disabled={isSyncingDrive}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-800 hover:bg-slate-100 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 border border-slate-200 cursor-pointer disabled:opacity-70"
            >
              {isSyncingDrive ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-xs">Conectando...</span>
                </>
              ) : (
                <>
                  {/* Official Google G Logo SVG */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  <span className="text-xs">Sign in with Google Drive</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-sm mb-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200/50 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Nuvem Conectada
                </span>
                {user?.email && (
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                    {user.email}
                  </span>
                )}
                {autoSyncEnabled ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60 flex items-center gap-1">
                    <Zap className="h-3 w-3 fill-blue-600" /> Sincronização Automática Ativa
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Sincronização Manual
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                <span>Backup: <strong className="text-slate-700 font-mono">crateus_gestao_estrategica_backup.json</strong></span>
                <span>•</span>
                <span>Último salvamento: <strong className="text-emerald-700">{lastDriveSync || 'Nenhum registro nesta sessão'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
            {isSyncingDrive ? (
              <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span>Sincronizando...</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowConfirmSaveModal(true)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                  title="Salvar backup atual na sua nuvem"
                >
                  <CloudUpload className="h-4 w-4" />
                  <span>Salvar no Drive</span>
                </button>

                <button
                  onClick={() => setShowConfirmRestoreModal(true)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-200/80 transition-colors cursor-pointer"
                  title="Restaurar dados salvos do Google Drive"
                >
                  <CloudDownload className="h-4 w-4 text-blue-600" />
                  <span>Restaurar do Drive</span>
                </button>

                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
                  title="Configurações de Sincronização"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Configurações de Nuvem</h3>
                  <p className="text-xs text-slate-400">Google Drive Workspace Sync</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Sincronização Automática</span>
                  <button
                    onClick={handleToggleAutoSync}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Quando ativo, o sistema envia o backup atualizado para o seu Google Drive em segundo plano sempre que você fizer qualquer modificação ou fechar a janela, garantindo zero perda de dados.
                </p>
              </div>

              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-1.5">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  Segurança de Dados
                </h4>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Os dados são salvos exclusivamente no seu próprio Google Drive no arquivo <strong className="font-mono text-[10px]">crateus_gestao_estrategica_backup.json</strong>. Nenhuma outra pessoa tem acesso ao arquivo se você não o compartilhar no Drive.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (window.confirm('Deseja realmente desconectar a conta do Google Drive?')) {
                    disconnectFromDrive();
                    setShowSettingsModal(false);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Desconectar Conta</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-800 transition-colors"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MANUAL SAVE MODAL */}
      {showConfirmSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 font-bold text-base">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <CloudUpload className="h-6 w-6" />
              </div>
              <div>
                <h3>Confirmar Backup no Google Drive</h3>
                <p className="text-xs text-slate-400 font-normal">Sobrescrever arquivo na nuvem</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja salvar todos os dados locais de escolas, metas e relatórios da SME no seu Google Drive? 
              Isso atualizará ou criará o arquivo <strong className="font-mono text-[11px]">crateus_gestao_estrategica_backup.json</strong> com os dados que você está vendo agora.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmSaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmManualSave}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                Sim, Salvar no Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MANUAL RESTORE MODAL */}
      {showConfirmRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 font-bold text-base">
              <div className="p-2 bg-amber-50 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3>Confirmar Restauração de Dados</h3>
                <p className="text-xs text-slate-400 font-normal">Substituir dados locais na tela</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Atenção:</strong> Ao restaurar do Google Drive, os dados exibidos atualmente na sua tela serão substituídos pelas metas e relatórios do último backup sincronizado (<code className="font-mono text-[10px]">crateus_gestao_estrategica_backup.json</code>). Deseja continuar?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmRestoreModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmManualRestore}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                Sim, Restaurar do Drive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
