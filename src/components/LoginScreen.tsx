import React, { useState } from 'react';
import { useStrategicState } from '../stateContext';
import { 
  Lock, Mail, Eye, EyeOff, ShieldCheck, Key, HelpCircle, 
  Sparkles, CheckCircle2, AlertCircle, ArrowRight, Building2, User
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { state, loginWithPassword, setCurrentUserId } = useStrategicState();
  const [emailOrName, setEmailOrName] = useState('coordenadoria.inovacao@crateus.ce.gov.br');
  const [password, setPassword] = useState('Crateus@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const logoUrl = state.systemSettings?.logoUrl;
  const coordinatorName = state.systemSettings?.coordinatorName || 'Prof. Francisco Reginaldo';
  const teamUsers = state.teamUsers || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = loginWithPassword(emailOrName, password);
    if (!result.success) {
      setErrorMsg(result.message || 'Erro de autenticação. Verifique e-mail e senha.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    setErrorMsg(null);
    const target = teamUsers.find(u => u.id === userId);
    if (target) {
      setEmailOrName(target.email);
      setPassword(target.password || 'Crateus@123');
      const res = loginWithPassword(target.email, target.password || 'Crateus@123');
      if (!res.success) {
        setErrorMsg(res.message || 'Erro ao autenticar usuário.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white" id="login-screen-wrapper">
      
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        
        {/* TOP BRANDING / BADGE */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 shadow-xl backdrop-blur-md">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo Coordenadoria" className="h-14 w-auto max-w-[200px] object-contain" />
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 text-emerald-400 font-extrabold text-sm tracking-tight">
                <Building2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div className="text-left leading-tight">
                  <span className="block font-black uppercase text-xs tracking-wider text-white">Coordenadoria de Inovação</span>
                  <span className="block text-[10px] text-emerald-400/90 font-mono">e Culturas Digitais • Crateús</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight sm:text-2xl">
              Plataforma de Gestão Estratégica
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-medium">
              Acesso restrito a servidores e membros da equipe técnica da coordenadoria
            </p>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10" id="form-login">
            
            {errorMsg && (
              <div className="bg-rose-950/80 border border-rose-600/50 text-rose-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-fade-in">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                E-mail Funcional ou Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrName}
                  onChange={(e) => setEmailOrName(e.target.value)}
                  placeholder="Ex: coordenadoria.inovacao@crateus.ce.gov.br"
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs font-medium text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  id="input-login-email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline font-bold transition-colors cursor-pointer"
                  id="btn-forgot-password"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-4 pr-10 py-3 text-xs font-medium text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                  id="input-login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider mt-2"
              id="btn-submit-login"
            >
              <span>Entrar na Plataforma</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* QUICK DEMO USERS SHORTCUTS */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-400" />
                Atalhos de Acesso Rápido para Avaliação:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teamUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    u.role === 'administrador'
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-700/50 text-emerald-200'
                      : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-[11px] font-extrabold truncate text-white">{u.name}</p>
                      {u.role === 'administrador' && (
                        <ShieldCheck className="h-3 w-3 text-yellow-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 truncate">{u.roleTitle}</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded-md shrink-0">
                    {u.role === 'administrador' ? 'Admin' : 'Membro'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER METADATA */}
        <div className="text-center text-[11px] text-slate-500 font-medium space-y-1">
          <p>Coordenadoria de Inovação e Culturas Digitais — CICD</p>
          <p className="text-[10px] font-mono text-slate-600">Secretaria Municipal de Educação de Crateús • CE</p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in" id="modal-forgot-password-backdrop">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 text-slate-200 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-600/50 flex items-center justify-center mx-auto">
              <HelpCircle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-base text-white">Esqueceu sua Senha?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para garantir a segurança dos dados da Coordenadoria, as senhas de acesso são gerenciadas pelo Administrador Geral (<strong className="text-white">{coordinatorName}</strong>).
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Reset de Senha Padrão:</strong> O administrador pode redefinir sua senha diretamente no painel para a senha padrão institucional:
                  <span className="block mt-1 font-mono font-bold text-emerald-300 bg-slate-900 px-2 py-1 rounded-md text-center border border-emerald-500/30">
                    Crateus@123
                  </span>
                </p>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                Após o reset, você poderá fazer login normalmente e alterar sua senha no seu perfil.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Entendi, Voltar ao Login
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
