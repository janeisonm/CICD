import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { School } from '../types';
import { useStrategicState } from '../stateContext';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, 
  Trash2, Plus, ArrowRight, Eye, RefreshCw, X, HelpCircle, Users, Calendar, Award 
} from 'lucide-react';

interface ParsedSchoolRow {
  name: string;
  inep: string;
  directors: string;
  coordinators: string;
  totalStudents: number;
  reportedDate: string;
  isValid: boolean;
  errorMsg?: string;
}

export const SchoolExcelUpload: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { addSchoolsBulk, state } = useStrategicState();
  const [parsedRows, setParsedRows] = useState<ParsedSchoolRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download sample Excel template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nome da Escola': 'EEIEF Maria de Lourdes Cavalcante',
        'Código INEP': '23089104',
        'Diretor(es)': 'Antônia de Maria Silva',
        'Coordenador(es)': 'Francisca Gomes / Carlos Eduardo',
        'Total de Alunos': 450,
        'Data Informada': '26/07/2026'
      },
      {
        'Nome da Escola': 'EEIEF Deputado Vilebaldo Martins',
        'Código INEP': '23089215',
        'Diretor(es)': 'Roberto Carlos Bezerra',
        'Coordenador(es)': 'Ana Paula Souza',
        'Total de Alunos': 320,
        'Data Informada': '25/07/2026'
      },
      {
        'Nome da Escola': 'CEI Pequeno Príncipe (Educação Infantil)',
        'Código INEP': '23089330',
        'Diretor(es)': 'Luciana Mendes',
        'Coordenador(es)': 'Juliana Oliveira',
        'Total de Alunos': 180,
        'Data Informada': '26/07/2026'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelos_Escolas');

    // Auto-adjust column widths
    worksheet['!cols'] = [
      { wch: 45 }, // Nome da Escola
      { wch: 15 }, // Código INEP
      { wch: 30 }, // Diretor(es)
      { wch: 35 }, // Coordenador(es)
      { wch: 18 }, // Total de Alunos
      { wch: 18 }  // Data Informada
    ];

    XLSX.writeFile(workbook, 'modelo_cadastro_em_massa_escolas.xlsx');
  };

  // Helper to flexibly find key in row object
  const findValue = (row: any, keywords: string[]): any => {
    const keys = Object.keys(row);
    for (const kw of keywords) {
      const match = keys.find(k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
      if (match && row[match] !== undefined && row[match] !== null && row[match] !== '') {
        return row[match];
      }
    }
    return undefined;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData || rawData.length === 0) {
          setError('O arquivo Excel está vazio ou não possui cabeçalhos identificáveis.');
          setIsProcessing(false);
          return;
        }

        const mappedRows: ParsedSchoolRow[] = rawData.map((row, idx) => {
          const nameVal = findValue(row, ['nome da escola', 'nome', 'escola', 'unidade', 'instituição', 'escola municipal']);
          const inepVal = findValue(row, ['código inep', 'inep', 'codigo inep', 'cod inep', 'cód. inep', 'cod', 'código']);
          const dirVal = findValue(row, ['diretor', 'diretores', 'diretora', 'gestor', 'direção', 'responsável']);
          const coordVal = findValue(row, ['coordenador', 'coordenadores', 'coordenadora', 'coordenação', 'pedagógico', 'pedagogica']);
          const studentsVal = findValue(row, ['total de alunos', 'alunos', 'total alunos', 'qtd alunos', 'matrículas', 'estudantes', 'quantidade']);
          const dateVal = findValue(row, ['data informada', 'data', 'atualização', 'data atualização', 'referência', 'relatório']);

          const nameStr = nameVal ? String(nameVal).trim() : '';
          const inepStr = inepVal ? String(inepVal).trim() : '';
          const dirStr = dirVal ? String(dirVal).trim() : 'Não informado';
          const coordStr = coordVal ? String(coordVal).trim() : 'Não informado';
          
          let studentsNum = 0;
          if (studentsVal !== undefined && studentsVal !== '') {
            const parsed = Number(String(studentsVal).replace(/[^0-9]/g, ''));
            if (!isNaN(parsed)) studentsNum = parsed;
          }

          let dateStr = new Date().toLocaleDateString('pt-BR');
          if (dateVal instanceof Date) {
            dateStr = dateVal.toLocaleDateString('pt-BR');
          } else if (dateVal) {
            dateStr = String(dateVal).trim();
          }

          let isValid = true;
          let errorMsg = undefined;

          if (!nameStr) {
            isValid = false;
            errorMsg = 'Nome da escola ausente';
          }

          return {
            name: nameStr,
            inep: inepStr,
            directors: dirStr,
            coordinators: coordStr,
            totalStudents: studentsNum,
            reportedDate: dateStr,
            isValid,
            errorMsg
          };
        });

        setParsedRows(mappedRows);
        setShowPreview(true);
      } catch (err: any) {
        console.error('Erro ao ler Excel:', err);
        setError('Falha ao processar arquivo Excel. Certifique-se de que é um formato (.xlsx, .xls ou .csv) válido.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Erro na leitura do arquivo pelo navegador.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Nenhuma escola válida encontrada no arquivo para importar.');
      return;
    }

    const newSchools: School[] = validRows.map(r => ({
      id: 'excel-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name: r.name,
      inep: r.inep,
      directors: r.directors,
      coordinators: r.coordinators,
      totalStudents: r.totalStudents,
      reportedDate: r.reportedDate,
      // Default infrastructure and inventory values
      neighborhood: 'Não informado',
      infrastructureLevel: 'Aceitável',
      internetQuality: 'Boa',
      internetSpeedMbps: 50,
      equipmentCataloged: 0,
      equipmentRecovered: 0,
      equipmentDefective: 0,
      visitsCount: 0,
      needs: ['Cadastro inicial em massa via planilha Excel'],
      recommendations: ['Verificar e complementar inventário de computadores e conectividade'],
      pendingActions: [],
      status: 'pendente',
      servesInfant: true,
      servesElementary1: true,
      servesElementary2: true,
      desktopQty: 0,
      desktopWorkingQty: 0,
      notebookQty: 0,
      notebookWorkingQty: 0,
      tabletQty: 0,
      tabletWorkingQty: 0,
      internetProvider: 'Não informada',
      internetAccessPoints: []
    }));

    addSchoolsBulk(newSchools);
    alert(`✅ Sucesso! ${newSchools.length} escolas foram cadastradas em massa na plataforma!`);
    
    // Reset state
    setParsedRows([]);
    setFileName(null);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    if (onSuccess) onSuccess();
  };

  const handleClear = () => {
    setParsedRows([]);
    setFileName(null);
    setShowPreview(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-800/40 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/30">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Cadastro em Massa
              </span>
              <span className="text-xs text-slate-400">Importador Excel (.xlsx / .csv)</span>
            </div>
            <h3 className="font-bold text-lg text-white mt-1">Importação Planilha de Escolas da Rede Municipal</h3>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          type="button"
          className="flex items-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white border border-emerald-500/40 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Baixar Modelo Excel (.xlsx)</span>
        </button>
      </div>

      {/* Instructions */}
      {!showPreview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-mono">1</span>
              <span>Estrutura da Planilha</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O arquivo deve conter colunas com cabeçalhos como: <strong className="text-white">Nome da Escola</strong>, <strong className="text-white">Código INEP</strong>, <strong className="text-white">Diretor(es)</strong>, <strong className="text-white">Coordenador(es)</strong>, <strong className="text-white">Total de Alunos</strong> e <strong className="text-white">Data Informada</strong>.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[11px] font-mono">2</span>
              <span>Reconhecimento Inteligente</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O sistema reconhece sinônimos e variações de nomes nas colunas automaticamente, permitindo importar planilhas já existentes da secretaria sem reformatação complexa.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-mono">3</span>
              <span>Revisão Antes de Salvar</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Após selecionar o arquivo, você verá uma tabela de pré-visualização para conferir todos os dados, alunos e gestores antes de integrar em massa à plataforma.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-950/80 border border-red-500/50 rounded-2xl p-4 flex items-center justify-between text-red-200 text-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Box */}
      {!showPreview ? (
        <div className="border-2 border-dashed border-emerald-600/40 hover:border-emerald-500 bg-slate-900/60 rounded-3xl p-8 text-center transition-all duration-300 group">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload-input"
          />
          <label
            htmlFor="excel-upload-input"
            className="cursor-pointer flex flex-col items-center justify-center gap-4 py-4"
          >
            <div className="p-4 bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 rounded-3xl transition-all duration-300 border border-emerald-500/20">
              {isProcessing ? (
                <RefreshCw className="h-10 w-10 animate-spin" />
              ) : (
                <Upload className="h-10 w-10" />
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {isProcessing ? 'Processando arquivo...' : 'Clique para selecionar a Planilha Excel ou arraste aqui'}
              </h4>
              <p className="text-xs text-slate-400">
                Formatos compatíveis: Microsoft Excel (<span className="text-emerald-400 font-mono">.xlsx</span>, <span className="text-emerald-400 font-mono">.xls</span>) ou CSV (<span className="text-emerald-400 font-mono">.csv</span>)
              </p>
            </div>
            <span className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-colors mt-2">
              Selecionar Arquivo no Computador
            </span>
          </label>
        </div>
      ) : (
        /* Preview Table Section */
        <div className="space-y-5 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Arquivo analisado: <span className="text-emerald-300 font-mono">{fileName}</span></h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pronto para importar: <strong className="text-emerald-400">{validCount} escolas válidas</strong> 
                  {invalidCount > 0 && <span className="text-amber-400 ml-2">({invalidCount} com pendência)</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                type="button"
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Escolher Outro Arquivo
              </button>
              <button
                onClick={handleConfirmImport}
                type="button"
                disabled={validCount === 0}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-extrabold shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Confirmar Cadastro de {validCount} Escolas</span>
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-inner max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/90 text-[10px] font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-700 sticky top-0 z-10">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Nome da Escola</th>
                  <th className="p-3">Código INEP</th>
                  <th className="p-3">Diretor(es)</th>
                  <th className="p-3">Coordenador(es)</th>
                  <th className="p-3 text-right">Total Alunos</th>
                  <th className="p-3 text-center">Data Informada</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs font-medium">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-slate-800/40 transition-colors ${!row.isValid ? 'bg-red-950/30' : ''}`}>
                    <td className="p-3 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3 font-bold text-white">{row.name || <span className="text-red-400 italic">Vazio</span>}</td>
                    <td className="p-3 text-slate-300 font-mono">{row.inep || '-'}</td>
                    <td className="p-3 text-slate-300">{row.directors}</td>
                    <td className="p-3 text-slate-300">{row.coordinators}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-300">
                      {row.totalStudents > 0 ? row.totalStudents.toLocaleString('pt-BR') : '0'}
                    </td>
                    <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{row.reportedDate}</td>
                    <td className="p-3 text-center">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30" title={row.errorMsg}>
                          <AlertCircle className="h-3 w-3" /> Inválido
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 px-2">
            <span>Mostrando {parsedRows.length} linha(s) encontrada(s) no Excel</span>
            <span>Escolas importadas serão adicionadas à lista da plataforma com status inicial pendente.</span>
          </div>

        </div>
      )}

    </div>
  );
};
