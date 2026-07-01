import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  FileArchive, 
  GitBranch, 
  FolderOpen, 
  History, 
  ArrowRight,
  Cpu,
  HelpCircle,
  Shield,
  Layers,
  Activity,
  Network,
  Zap,
  Lock,
  Globe,
  BookOpen,
  X,
  ChevronRight,
  Info,
  Terminal
} from "lucide-react";
import { TabbedCodeBlock } from "./helper/TabbedCodeBlock";
import { TutorialPortal } from "./tutorial/tutorial";

interface MainScreenProps {
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  gitRepoUrl: string;
  setGitRepoUrl: (url: string) => void;
  handleZipUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleGitImport: (e: React.FormEvent) => void;
  recentProjects: Array<{ projectName: string; healthScore: number; issuesCount: number; lastUpdated: string }>;
  handleSelectRecentProject: (name: string) => Promise<void>;
  handleLoadSampleProject: (sampleName: 'ecommerce' | 'microservice' | 'fintech') => void;
  setShowSettings?: (show: boolean) => void;
  setActiveTab?: (tab: string) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  isDragging,
  setIsDragging,
  gitRepoUrl,
  setGitRepoUrl,
  handleZipUpload,
  handleGitImport,
  recentProjects,
  handleSelectRecentProject,
  handleLoadSampleProject,
}) => {
  const gitInputRef = React.useRef<HTMLInputElement>(null);
  const [activeWorkers, setActiveWorkers] = useState(4);
  const [latency, setLatency] = useState(14);
  
  // Tutorial Modal State
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Simulate network dashboard metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWorkers(prev => Math.max(3, Math.min(6, prev + (Math.random() > 0.5 ? 1 : -1))));
      setLatency(prev => Math.max(8, Math.min(22, prev + Math.floor(Math.random() * 5 - 2))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const adcSnippets = [
    {
      tab: "Java",
      language: "java",
      code: `import com.google.api.gax.paging.Page;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import java.io.IOException;

public class AuthenticateImplicitWithAdc {
  public static void main(String[] args) throws IOException {
    String projectId = "your-google-cloud-project-id";
    authenticateImplicitWithAdc(projectId);
  }

  public static void authenticateImplicitWithAdc(String project) throws IOException {
    Storage storage = StorageOptions.newBuilder().setProjectId(project).build().getService();

    System.out.println("Buckets:");
    Page<Bucket> buckets = storage.list();
    for (Bucket bucket : buckets.iterateAll()) {
      System.out.println(bucket.toString());
    }
  }
}`
    },
    {
      tab: "Node.js",
      language: "javascript",
      code: `const {Storage} = require('@google-cloud/storage');

async function authenticateImplicitWithAdc() {
  const storage = new Storage();

  console.log('Buckets:');
  const [buckets] = await storage.getBuckets();
  buckets.forEach(bucket => {
    console.log(bucket.name);
  });
}

authenticateImplicitWithAdc().catch(console.error);`
    },
    {
      tab: "Python",
      language: "python",
      code: `from google.cloud import storage

def authenticate_implicit_with_adc(project_id):
    storage_client = storage.Client(project=project_id)
    buckets = list(storage_client.list_buckets())
    print("Buckets:")
    for bucket in buckets:
        print(bucket.name)`
    },
    {
      tab: "Go",
      language: "go",
      code: `package main

import (
	"context"
	"fmt"
	"log"
	"cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

func main() {
	ctx := context.Background()
	client, err := storage.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	defer client.Close()

	it := client.Buckets(ctx, "your-project-id")
	for {
		battrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("Failed to iterate: %v", err)
		}
		fmt.Printf("Bucket: %s\\n", battrs.Name)
	}
}`
    }
  ];

  const apiKeySnippets = [
    {
      tab: "C#",
      language: "csharp",
      code: `using Google.Cloud.Language.V1;
using System;

public class UseApiKeySample
{
    public void AnalyzeSentiment(string apiKey)
    {
        LanguageServiceClient client = new LanguageServiceClientBuilder
        {
            ApiKey = apiKey
        }.Build();

        string text = "Hello, world!";
        AnalyzeSentimentResponse response = client.AnalyzeSentiment(Document.FromPlainText(text));
        Console.WriteLine($"Sentiment Score: {response.DocumentSentiment.Score}");
    }
}`
    },
    {
      tab: "Node.js",
      language: "javascript",
      code: `const {LanguageServiceClient} = require('@google-cloud/language');

async function analyzeSentiment(apiKey) {
  const client = new LanguageServiceClient({ apiKey });
  const text = 'Hello, world!';
  const [response] = await client.analyzeSentiment({
    document: { content: text, type: 'PLAIN_TEXT' }
  });
  console.log(\`Score: \${response.documentSentiment.score}\`);
}`
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030308] overflow-y-auto custom-scrollbar select-none relative font-sans text-slate-300">
      
      {/* Dynamic Futuristic Accents (Cyberpunk Mesh and Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f605_1px,transparent_1px),linear-gradient(to_bottom,#3b82f605_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Floating Glowing Neon Orbs */}
      <div className="absolute top-[5%] left-[10%] w-[380px] h-[380px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-[40%] right-[5%] w-[420px] h-[420px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div 
        className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-7xl mx-auto w-full relative z-10 min-h-screen pb-20"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
      >
        <div className="w-full flex flex-col gap-12">
          
          {/* Header Banner - Sleek Dark Futuristic Glassmorphism */}
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-slate-900 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-left">
            <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-4 border border-indigo-500/30 shadow-md shadow-indigo-950/20">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                CodeScope Engine v2.4.2 Active
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Start Static Analysis
              </h1>
              <p className="text-slate-450 text-sm mt-3 max-w-2xl leading-relaxed font-medium">
                Kompleksowa platforma do głębokiego skanowania architektonicznego, detekcji luk bezpieczeństwa OWASP-10 oraz symulacji runtime.
              </p>
              <div className="mt-5">
                <button
                  onClick={() => setIsTutorialOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-97 cursor-pointer border border-indigo-500/20"
                >
                  <BookOpen size={14} />
                  Dokumentacja & Tutorial (A-Z)
                </button>
              </div>
            </div>

            {/* Simulated System Metrics (Futuristic Grid) */}
            <div className="grid grid-cols-2 gap-4 shrink-0 bg-slate-950/80 border border-slate-850 p-4 rounded-2xl shadow-inner min-w-[240px]">
              <div className="text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Model AI</span>
                <span className="text-xs font-mono font-extrabold text-white flex items-center gap-1.5 mt-1">
                  <Sparkles size={11} className="text-amber-400 animate-pulse" />
                  Gemini 2.5 Flash
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Latencja</span>
                <span className="text-xs font-mono font-extrabold text-emerald-400 mt-1 block">
                  {latency} ms
                </span>
              </div>
              <div className="text-left border-t border-slate-900 pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Aktywne Wątki</span>
                <span className="text-xs font-mono font-extrabold text-indigo-400 mt-1 block">
                  {activeWorkers} rdzenie
                </span>
              </div>
              <div className="text-left border-t border-slate-900 pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Analizator AST</span>
                <span className="text-xs font-mono font-extrabold text-cyan-400 mt-1 block">
                  Operational
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Controls & History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Column: Import Options */}
            <div className="flex flex-col gap-10">
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Layers size={14} className="text-indigo-400" />
                  Metody Importu Workspace
                </h3>
                
                <div className="flex flex-col gap-5">
                  
                  {/* File Upload Premium Card */}
                  <label className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900/60 border border-slate-900 hover:border-indigo-500/40 hover:shadow-[0_0_35px_rgba(99,102,241,0.12)] group cursor-pointer transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
                    <div className="bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300 p-4 rounded-xl transition-all duration-300">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-white group-hover:text-indigo-300 font-extrabold text-base block transition-colors duration-300">Wgraj archiwum kodu (.ZIP)</span>
                      <span className="text-xs text-slate-400 mt-1.5 block leading-relaxed">
                        Przeciągnij folder projektu lub plik skompresowany bezpośrednio do okna
                      </span>
                    </div>
                    <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
                  </label>

                  {/* Git Clone Premium Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900/60 border border-slate-900 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl">
                        <GitBranch className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <span className="text-white font-extrabold text-base block">Klonuj zdalne repozytorium</span>
                        <span className="text-xs text-slate-400 mt-1 block">Bezpośrednie pobieranie i skanowanie z GitHub/GitLab</span>
                      </div>
                    </div>
                    <form onSubmit={handleGitImport} className="flex gap-2.5 mt-2">
                      <input 
                        ref={gitInputRef}
                        type="url" 
                        placeholder="https://github.com/nazwa-uzytkownika/nazwa-projektu.git"
                        value={gitRepoUrl}
                        onChange={(e) => setGitRepoUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all shadow-inner font-mono"
                        required
                      />
                      <button 
                        type="submit"
                        className="px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-97 cursor-pointer hover:shadow-indigo-500/25 flex items-center gap-1.5 shrink-0"
                      >
                        <Zap size={11} />
                        Klonuj
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Template Sandboxes */}
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Szybkie szablony testowe (Sandbox Templates)
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'ecommerce', name: 'Spring Boot E-Commerce', tag: 'Java • Domain-Driven Design (DDD)', desc: 'Kompletny backend sklepu e-commerce z podziałem na warstwy i transakcje.', color: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-400' },
                    { id: 'microservice', name: 'Laravel CMS Backend', tag: 'PHP • Model-View-Controller', desc: 'Klasyczna architektura CMS z zaawansowaną walidacją modeli ORM.', color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400' },
                    { id: 'fintech', name: 'Express + Prisma Fintech API', tag: 'TypeScript • N-Tier API', desc: 'Szybkie asynchroniczne usługi bankowe z rozbudowanym schematem bazy danych.', color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400' }
                  ].map(sample => (
                    <button 
                      key={sample.id}
                      onClick={() => handleLoadSampleProject(sample.id as any)}
                      className="w-full text-left p-4 rounded-2xl bg-slate-950 border border-slate-900/80 hover:border-slate-800 transition-all duration-300 flex justify-between items-center group cursor-pointer hover:shadow-xl active:scale-99 hover:-translate-y-0.5 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, ${sample.color.split(' ')[0].replace('from-', '')}, ${sample.color.split(' ')[1].replace('to-', '')})` }} />
                      <div className="flex gap-4 items-center relative z-10">
                        <span className={`h-2 w-2 rounded-full bg-current ${sample.iconColor} shadow-[0_0_8px_currentColor]`} />
                        <div>
                          <span className="text-white text-sm font-extrabold block group-hover:text-indigo-300 transition-colors">{sample.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{sample.tag}</span>
                          <span className="text-[11px] text-slate-500 mt-1 block font-normal leading-relaxed">{sample.desc}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-white group-hover:translate-x-1.5 transition-all relative z-10" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: History & Stats */}
            <div className="flex flex-col gap-10">
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <History size={14} className="text-emerald-400" />
                  Historia Workspace
                </h3>
                
                {recentProjects && recentProjects.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {recentProjects.map((p) => (
                      <div 
                        key={p.projectName}
                        onClick={() => handleSelectRecentProject(p.projectName)}
                        className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl transition-all flex items-center justify-between group cursor-pointer hover:shadow-lg"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="bg-slate-900 group-hover:bg-indigo-500/10 text-slate-400 group-hover:text-indigo-400 p-3 rounded-xl shrink-0 transition-colors">
                            <FileArchive className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-white text-sm font-bold block truncate">{p.projectName}</span>
                            <span className="text-[11px] text-slate-450 block mt-1 truncate">
                              Wynik zdrowia: <strong className="text-indigo-400">{p.healthScore}%</strong> • <span className="text-rose-400 font-semibold">{p.issuesCount} problemów</span>
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold tracking-wider bg-slate-900 border border-slate-800 text-slate-400 px-3.5 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all select-none">
                          PRZYWRÓĆ
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-slate-900 border-dashed rounded-2xl p-12 text-center text-slate-500 text-xs bg-slate-950/30 backdrop-blur-sm shadow-inner">
                    <History className="h-8 w-8 mx-auto mb-3 opacity-30 text-indigo-400 animate-pulse" />
                    Brak wgranych projektów w sesji. Rozpocznij analizę powyżej, aby zapisać historię.
                  </div>
                )}
              </div>

              {/* Dynamic Engine Pipeline Visualization (Live Look) */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900/80 border border-slate-900 p-6 rounded-3xl flex flex-col gap-6 shadow-xl relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Network size={14} className="text-cyan-400" />
                    Technologie Skanowania (AST)
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 font-bold">LIVE PIPELINE</span>
                </div>

                <div className="grid grid-cols-1 gap-4 text-xs text-slate-350">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400">1</div>
                      <div className="w-0.5 h-10 bg-slate-900" />
                    </div>
                    <div className="pt-0.5">
                      <strong className="text-white block">Parser AST (Abstract Syntax Tree)</strong>
                      <span className="text-[11px] text-slate-450 mt-1 block leading-relaxed">
                        Dekonstruuje kod na drzewo semantyczne, analizując poprawność struktur, zależności i przestarzałe składnie.
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-cyan-400">2</div>
                      <div className="w-0.5 h-10 bg-slate-900" />
                    </div>
                    <div className="pt-0.5">
                      <strong className="text-white block">AI Security Auditor</strong>
                      <span className="text-[11px] text-slate-450 mt-1 block leading-relaxed">
                        Silnik zasilany Gemini skanuje wzorce kodu pod kątem SQL Injection, wycieków kluczy i krytycznych podatności OWASP.
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400">3</div>
                    </div>
                    <div className="pt-0.5">
                      <strong className="text-white block">Interactive Code Remediation</strong>
                      <span className="text-[11px] text-slate-450 mt-1 block leading-relaxed">
                        Generuje gotowe bloki poprawek (diffs) z możliwością natychmiastowego zapisania zmian bezpośrednio w pliku na dysku.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* GCP Authentication & API Key Guides */}
          <div className="mt-14 border-t border-slate-900 pt-12 text-left">
            <h2 className="text-xl font-black text-white mb-2 tracking-tight flex items-center gap-2">
              <Shield className="h-5.5 w-5.5 text-indigo-400" />
              Google Cloud Authentication Guide
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Przewodnik po bezpiecznej integracji z API Google Cloud. Wybierz metodę autentykacji odpowiednią dla Twojego środowiska.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]"></span>
                  1. Application Default Credentials (ADC)
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Zalecany standard autoryzacji lokalnej. Biblioteki klienckie automatycznie odczytują poświadczenia z aktywnego profilu gcloud SDK lub konta usługi.
                </p>
                <TabbedCodeBlock 
                  title="ADC Implicit Authentication examples"
                  snippets={adcSnippets} 
                />
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]"></span>
                  2. Use API keys with client libraries
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Prosta metoda dla określonych usług (np. Translation API). Wymaga jawnego przekazania klucza w parametrach inicjalizacyjnych klienta.
                </p>
                <TabbedCodeBlock 
                  title="Explicit API Key auth examples"
                  snippets={apiKeySnippets} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-14 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2.5 bg-slate-950 py-2.5 px-5 rounded-full border border-slate-900 shadow-inner">
            <HelpCircle className="h-4 w-4 text-indigo-400 animate-bounce" />
            <span>Chcesz szybko przeanalizować kod? Przeciągnij plik ZIP z projektem na dowolny punkt ekranu.</span>
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-slate-650">
            <span>[V2.4.2 Enterprise Sandbox]</span>
            <span>[Operational Mode: LIVE]</span>
          </div>
        </div>
      </div>

      {/* Drag Over Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#030308]/95 backdrop-blur-md border-4 border-dashed border-indigo-500/40 flex flex-col items-center justify-center pointer-events-none z-50 animate-in fade-in duration-300">
          <div className="bg-indigo-500/10 p-8 rounded-full mb-6 border border-indigo-500/25 shadow-lg">
            <UploadCloud className="h-16 w-16 text-indigo-400 animate-bounce" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-2">Upuść archiwum ZIP</h3>
          <p className="text-xs text-slate-455 font-mono">Serwer automatycznie uruchomi proces dekompilacji i parsowania AST</p>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#030308] text-slate-550 flex justify-between items-center px-4 text-[10px] select-none font-mono z-50 border-t border-slate-900/60 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:text-slate-300 cursor-pointer transition-colors">
            <Cpu className="h-3 w-3 text-emerald-500" />
            <span>Server: Connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Network className="h-3 w-3 text-indigo-500" />
            <span>local-host</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span>Drzewo AST v2.4</span>
          <span>UTF-8</span>
          <span>TypeScript React</span>
        </div>
      </div>

      {/* Google Dev-Style Interactive Documentation Portal Modal */}
      {isTutorialOpen && (
        <TutorialPortal onClose={() => setIsTutorialOpen(false)} />
      )}
    </div>
  );
};
