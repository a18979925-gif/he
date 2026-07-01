import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileArchive, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  Terminal, 
  Settings,
  CreditCard,
  Sparkles,
  Lock,
  Check,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Info,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { StreamEvent, AnalysisReport, AnalysisSummary, AuditIssue } from '../types';

interface UploadSectionProps {
  onAnalysisCompleted: (report: AnalysisReport) => void;
}

export default function UploadSection({ onAnalysisCompleted }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'streaming' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [scannedFilesCount, setScannedFilesCount] = useState(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [foundIssues, setFoundIssues] = useState({ security: 0, quality: 0, refactor: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  // Plan & Payment States
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'super'>('super');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'blik' | 'gpay'>('card');
  const [blikCode, setBlikCode] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const sseRef = useRef<EventSource | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
        setErrorMessage('');
      } else {
        setErrorMessage('Niepoprawny format pliku. Prześlij archiwum ZIP (.zip) zawierające kod źródłowy.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.zip')) {
        setFile(selectedFile);
        setErrorMessage('');
      } else {
        setErrorMessage('Niepoprawny format pliku. Prześlij archiwum ZIP (.zip) zawierające kod źródłowy.');
      }
    }
  };

  const appendLog = (msg: string) => {
    setLiveLogs(prev => [msg, ...prev].slice(0, 30));
  };

  const startAnalysis = async (planToUse?: 'basic' | 'super') => {
    if (!file) return;
    const plan = planToUse || selectedPlan;

    setStatus('uploading');
    setProgress(2);
    setStageMessage('Przesyłanie archiwum ZIP do serwera...');
    setLiveLogs([]);
    setFoundIssues({ security: 0, quality: 0, refactor: 0 });
    setScannedFilesCount(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('plan', plan);

    try {
      const res = await fetch('/api/analysis/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Serwer odrzucił plik archiwum.');
      }

      const data = await res.json();
      const analysisId = data.analysisId;

      // Start SSE listening
      setStatus('streaming');
      setProgress(5);
      appendLog(`[Core] Przesyłanie powiodło się. Przypisany ID analizy: ${analysisId}`);
      
      const sse = new EventSource(`/api/analysis/${analysisId}/stream`);
      sseRef.current = sse;

      sse.onmessage = (event) => {
        const evData: StreamEvent | { type: 'CONNECTED'; analysisId: string } = JSON.parse(event.data);
        
        if (evData.type === 'CONNECTED') {
          appendLog(`[SSE] Kanał strumieniowy czasu rzeczywistego nawiązany.`);
          return;
        }

        switch (evData.type) {
          case 'STAGE_CHANGED':
            setStageMessage(evData.message);
            setProgress(evData.progress);
            appendLog(`[Etap] Zmiana etapu: ${evData.status.toUpperCase()} - ${evData.message}`);
            break;

          case 'FILE_SCANNED':
            setScannedFilesCount(prev => prev + 1);
            setProgress(evData.progress);
            appendLog(`[Skaner] Analiza wzorca pliku: ${evData.filePath}`);
            break;

          case 'ISSUE_FOUND':
            const category = evData.issue.category;
            setFoundIssues(prev => ({
              ...prev,
              [category]: prev[category] + 1
            }));
            appendLog(`[Wykryto] ${evData.issue.severity.toUpperCase()}: ${evData.issue.title} w ${evData.issue.filePath}:${evData.issue.line}`);
            break;

          case 'STAGE_COMPLETED':
            setProgress(100);
            appendLog(`[Final] Raport skompilowany. Suma problemów: ${evData.summary.issuesCount.security + evData.summary.issuesCount.quality + evData.summary.issuesCount.refactor}`);
            break;

          case 'ANALYSIS_DONE':
            setStatus('completed');
            sse.close();
            onAnalysisCompleted(evData.report);
            break;

          case 'ERROR':
            setStatus('failed');
            setErrorMessage(evData.message);
            appendLog(`[Błąd] Analiza przerwana: ${evData.message}`);
            sse.close();
            break;
        }
      };

      sse.onerror = (err) => {
        console.error('SSE connection errored out:', err);
        appendLog(`[Ostrzeżenie] Utracono połączenie SSE. Trwa próba pobrania raportu końcowego...`);
      };

    } catch (err: any) {
      console.error(err);
      setStatus('failed');
      setErrorMessage(err?.message || 'Nie udało się zainicjować analizy kodu.');
    }
  };

  const handleStartClicked = () => {
    if (!file) return;
    setIsPaymentModalOpen(true);
  };

  const handlePayAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    
    if (paymentMethod === 'blik') {
      setPaymentStep('Inicjowanie transakcji BLIK...');
      await new Promise(r => setTimeout(r, 600));
      setPaymentStep('Wysyłanie żądania autoryzacji do banku...');
      await new Promise(r => setTimeout(r, 800));
      setPaymentStep('Oczekiwanie na potwierdzenie w aplikacji mobilnej banku (BLIK)...');
      await new Promise(r => setTimeout(r, 1400));
      setPaymentStep('Płatność autoryzowana pomyślnie! Rozpoczynanie audytu...');
      await new Promise(r => setTimeout(r, 600));
    } else if (paymentMethod === 'gpay') {
      setPaymentStep('Inicjowanie transakcji Google Pay...');
      await new Promise(r => setTimeout(r, 600));
      setPaymentStep('Autoryzacja portfela cyfrowego i tokenu płatności...');
      await new Promise(r => setTimeout(r, 900));
      setPaymentStep('Płatność autoryzowana pomyślnie! Rozpoczynanie audytu...');
      await new Promise(r => setTimeout(r, 600));
    } else {
      // Step 1: Secure Link
      setPaymentStep('Inicjowanie bezpiecznej transakcji SSL 256-bit...');
      await new Promise(r => setTimeout(r, 600));
      
      // Step 2: Verification
      setPaymentStep('Weryfikacja karty przez bank i 3D-Secure...');
      await new Promise(r => setTimeout(r, 800));
      
      // Step 3: Approve & Send
      setPaymentStep('Płatność autoryzowana pomyślnie! Rozpoczynanie audytu...');
      await new Promise(r => setTimeout(r, 600));
    }
    
    setIsProcessingPayment(false);
    setIsPaymentModalOpen(false);
    
    // Trigger real background analysis
    await startAnalysis(selectedPlan);
  };

  const cancelOrReset = () => {
    if (sseRef.current) {
      sseRef.current.close();
    }
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setLiveLogs([]);
    setErrorMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight text-center flex items-center justify-center gap-2">
          <Shield className="text-blue-600 fill-blue-50" size={20} />
          Uruchom Skaner Kodu ZIP
        </h2>
        <p className="text-xs text-gray-500 text-center mt-1">
          Wykrywaj luki OWASP, badaj architekturę, błędy logiczne i generuj natychmiastowe łaty kodu w czasie rzeczywistym.
        </p>

        {status === 'idle' ? (
          <div className="mt-6 space-y-5">
            {/* Drag & Drop Card */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center">
                <UploadCloud size={44} className="text-gray-400 mb-3" />
                <p className="text-sm font-semibold text-gray-700">
                  {file ? file.name : 'Przeciągnij i upuść archiwum ZIP tutaj'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'lub kliknij, aby przeglądać dysk lokalny'}
                </p>
              </div>
            </div>

            {/* Plan selection and details cards shown when a file is selected */}
            {file && (
              <div className="space-y-4 text-left animate-in fade-in duration-300">
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
                    Wybierz Poziom Audytu Kodu:
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Plan */}
                    <div 
                      onClick={() => setSelectedPlan('basic')}
                      className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        selectedPlan === 'basic' 
                          ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900' 
                          : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Skan Podstawowy</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Szybka weryfikacja antywzorców i OWASP</p>
                        </div>
                        <span className="text-sm font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">1 PLN</span>
                      </div>
                      <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                        <li className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-500" /> Skaner heurystyczny regex
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-500" /> Klasyczne luki i wycieki kluczy
                        </li>
                        <li className="flex items-center gap-1.5 text-slate-400">
                          <span className="text-xs">✕</span> Brak modelowania logicznego AI
                        </li>
                        <li className="flex items-center gap-1.5 text-slate-400">
                          <span className="text-xs">✕</span> Brak generowania łat Unified Diff
                        </li>
                      </ul>
                    </div>

                    {/* Super AI Plan */}
                    <div 
                      onClick={() => setSelectedPlan('super')}
                      className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        selectedPlan === 'super' 
                          ? 'bg-blue-50/40 border-blue-600 shadow-sm ring-1 ring-blue-600' 
                          : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-blue-50/10'
                      }`}
                    >
                      {/* Highlight Badge */}
                      <div className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                        <Sparkles size={8} /> PODWÓJNY SILNIK
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1">
                            Super Skan AI <Zap size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
                          </h4>
                          <p className="text-[10px] text-blue-500/80 mt-0.5">Heurystyki + Modelowanie Gemini 3.5 Flash</p>
                        </div>
                        <span className="text-sm font-black text-white bg-blue-600 px-2.5 py-1 rounded-xl">5 PLN</span>
                      </div>
                      <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                        <li className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Check size={12} className="text-blue-500" /> Etap 1: Fast Heuristic Scan
                        </li>
                        <li className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Check size={12} className="text-blue-500" /> Etap 2: Dynamiczny audyt logiczny AI
                        </li>
                        <li className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Check size={12} className="text-blue-500" /> Inteligentne łaty kodu (Unified Diff)
                        </li>
                        <li className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Check size={12} className="text-blue-500" /> Interaktywne czatowanie z AI
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs text-left animate-shake">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {file && (
                <>
                  <button
                    onClick={cancelOrReset}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Wyczyść plik
                  </button>
                  <button
                    onClick={handleStartClicked}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CreditCard size={14} />
                    Zapłać i Rozpocznij Skan
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Real-time Status Progress */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1.5 text-blue-600 animate-pulse">
                  <RefreshCw size={12} className="animate-spin" />
                  {stageMessage || 'Trwa analizowanie...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-50">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Przeskanowane pliki</span>
                <div className="text-lg font-bold text-gray-800 mt-1">{scannedFilesCount}</div>
              </div>

              <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 text-center">
                <span className="text-[10px] text-rose-500 font-semibold uppercase">Luki bezpieczeństwa</span>
                <div className="text-lg font-bold text-rose-700 mt-1">{foundIssues.security}</div>
              </div>

              <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 text-center">
                <span className="text-[10px] text-amber-500 font-semibold uppercase">Code Smells</span>
                <div className="text-lg font-bold text-amber-700 mt-1">{foundIssues.quality}</div>
              </div>

              <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-center">
                <span className="text-[10px] text-blue-500 font-semibold uppercase">Refaktoryzacje</span>
                <div className="text-lg font-bold text-blue-700 mt-1">{foundIssues.refactor}</div>
              </div>
            </div>

            {/* Scrolling logs console terminal */}
            <div id="logs-console" className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-left">
              <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2 border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1">
                  <Terminal size={12} /> Logi Skanera na żywo
                </span>
                <span className="text-slate-500">Silnik {selectedPlan === 'super' ? 'AI Gemini' : 'Fast Heuristics'}</span>
              </div>

              <div className="font-mono text-[10px] text-slate-300 h-32 overflow-y-auto space-y-1 scrollbar-thin select-all">
                {liveLogs.length === 0 ? (
                  <div className="text-slate-500 text-center py-10">Inicjowanie potoku strumieniowego...</div>
                ) : (
                  liveLogs.map((log, i) => {
                    let textClass = 'text-slate-300';
                    if (log.includes('CRITICAL')) textClass = 'text-rose-400 font-bold';
                    else if (log.includes('WARNING')) textClass = 'text-amber-400';
                    else if (log.includes('Ostrzeżenie')) textClass = 'text-amber-400';
                    else if (log.includes('[Etap]')) textClass = 'text-blue-400 font-semibold';
                    else if (log.includes('Błąd')) textClass = 'text-red-500 font-bold';

                    return (
                      <div key={i} className={`line-clamp-1 truncate ${textClass}`}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs text-left">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={cancelOrReset}
                className="px-5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Przerwij i wyjdź
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mock Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setIsPaymentModalOpen(false)} 
                  className="text-slate-400 hover:text-white transition-colors text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                <Lock size={12} className="text-blue-400" /> Bezpieczna płatność testowa
              </div>
              <h3 className="text-lg font-black tracking-tight mt-1">Stripe Checkout Simulation</h3>
              <p className="text-xs text-slate-400 mt-1">Zatwierdź transakcję, aby odblokować dedykowany audyt.</p>
            </div>

            {/* Simulated Receipt */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase block text-[8px] tracking-wider">Plan:</span>
                <span className="font-bold text-slate-700">
                  {selectedPlan === 'super' ? 'Super Skan AI (Podwójny Silnik)' : 'Skan Podstawowy (Heurystyki)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-semibold uppercase block text-[8px] tracking-wider">Do zapłaty:</span>
                <span className="text-base font-black text-slate-900">
                  {selectedPlan === 'super' ? '5,00 PLN' : '1,00 PLN'}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex bg-slate-100 rounded-lg p-1 mx-6 mt-4 border border-slate-200">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${paymentMethod === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Karta
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('blik')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${paymentMethod === 'blik' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
              >
                BLIK
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('gpay')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${paymentMethod === 'gpay' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
              >
                GPay
              </button>
            </div>

            {/* Credit Card Graphic mockup */}
            {paymentMethod === 'card' && (
              <div className="px-6 pt-5">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden aspect-[1.586/1] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-60">
                        {[...Array(6)].map((_, i) => <div key={i} className="border border-slate-900 rounded-2xs" />)}
                      </div>
                    </div>
                    <span className="text-xs font-black italic tracking-widest text-slate-300 uppercase">
                      {cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Test Card'}
                    </span>
                  </div>

                  <div className="text-lg font-mono font-bold tracking-widest text-center my-3 select-all">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end text-xs font-mono uppercase text-slate-300">
                    <div>
                      <span className="text-[7px] text-slate-400 block tracking-wider font-sans">Właściciel karty</span>
                      <span className="truncate max-w-[180px] inline-block font-semibold">{cardName || 'JAN KOWALSKI'}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[7px] text-slate-400 block tracking-wider font-sans">Ważność</span>
                      <span className="font-semibold">{cardExpiry || '12/29'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLIK Graphics */}
            {paymentMethod === 'blik' && (
              <div className="px-6 pt-5 text-center">
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center justify-center gap-2.5">
                  <div className="bg-pink-600 text-white px-5 py-2 rounded-xl font-black italic tracking-widest text-lg shadow-sm select-none">
                    blik
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                    Wprowadź 6-cyfrowy kod BLIK z aplikacji bankowej i zatwierdź go na swoim telefonie po kliknięciu Autoryzuj.
                  </p>
                </div>
              </div>
            )}

            {/* GPay Graphics */}
            {paymentMethod === 'gpay' && (
              <div className="px-6 pt-5 text-center">
                <div className="bg-slate-50 border border-slate-200/60 p-8 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <div className="bg-slate-950 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-sm tracking-wide">
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" /> Google Pay
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                    Szybka autoryzacja za pomocą karty płatniczej przypisanej do Twojego konta Google.
                  </p>
                </div>
              </div>
            )}

            {/* Input fields form */}
            <form onSubmit={handlePayAndStart} className="p-6 space-y-4">
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div className="text-left">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Numer karty</label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3 top-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        placeholder="4242 4242 4242 4242" 
                        value={cardNumber}
                        maxLength={19}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Imię i nazwisko właściciela</label>
                    <input 
                      type="text" 
                      required
                      placeholder="JAN KOWALSKI" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ważność (MM/YY)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="12/29" 
                        value={cardExpiry}
                        maxLength={5}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) {
                            val = val.substring(0, 2) + '/' + val.substring(2, 4);
                          }
                          setCardExpiry(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CVV</label>
                      <input 
                        type="password" 
                        required
                        placeholder="123" 
                        value={cardCvv}
                        maxLength={3}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'blik' && (
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">6-cyfrowy Kod BLIK</label>
                  <input 
                    type="text" 
                    required
                    placeholder="000 000" 
                    value={blikCode}
                    maxLength={7}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(.{3})/g, '$1 ').trim();
                      setBlikCode(val);
                    }}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-center text-lg font-bold tracking-widest focus:outline-hidden focus:border-slate-800 focus:bg-white font-mono"
                  />
                </div>
              )}

              {paymentMethod === 'gpay' && (
                <div className="text-center py-2 text-[11px] text-slate-500">
                  Google Pay automatycznie prześle token autoryzacji transakcji do serwisu rozliczeniowego.
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {paymentMethod === 'card' && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setCardNumber('4242 4242 4242 4242');
                      setCardName('JAN KOWALSKI');
                      setCardExpiry('12/29');
                      setCardCvv('123');
                    }}
                    className="w-full py-1.5 border border-dashed border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 bg-blue-50/20 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Sparkles size={11} /> Wypełnij automatycznie dane testowe
                  </button>
                )}

                {paymentMethod === 'blik' && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setBlikCode('123 456');
                    }}
                    className="w-full py-1.5 border border-dashed border-pink-200 hover:border-pink-400 text-pink-650 hover:text-pink-700 bg-pink-50/20 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Sparkles size={11} /> Generuj testowy kod BLIK
                  </button>
                )}

                {isProcessingPayment ? (
                  <div className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm">
                    <RefreshCw size={14} className="animate-spin text-blue-400" />
                    <span className="text-[10px] text-slate-300 font-medium animate-pulse">{paymentStep}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsPaymentModalOpen(false)} 
                      className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs transition-colors"
                    >
                      Anuluj
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Lock size={12} /> Autoryzuj {selectedPlan === 'super' ? '5,00 PLN' : '1,00 PLN'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
