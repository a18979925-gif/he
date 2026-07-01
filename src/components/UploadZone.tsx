import React from "react";
import { 
  Sparkles, 
  UploadCloud, 
  FileArchive, 
  GitBranch, 
  FolderOpen, 
  History, 
  Terminal, 
  Settings, 
  Search, 
  FileCode, 
  Play, 
  Code,
  ArrowRight,
  ExternalLink,
  Cpu,
  HelpCircle,
  Shield
} from "lucide-react";
import { TabbedCodeBlock } from "./helper/TabbedCodeBlock";

interface UploadZoneProps {
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

export const UploadZone: React.FC<UploadZoneProps> = ({
  isDragging,
  setIsDragging,
  gitRepoUrl,
  setGitRepoUrl,
  handleZipUpload,
  handleGitImport,
  recentProjects,
  handleSelectRecentProject,
  handleLoadSampleProject,
  setShowSettings,
  setActiveTab,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const gitInputRef = React.useRef<HTMLInputElement>(null);

  const handleTerminalClick = () => {
    handleLoadSampleProject('fintech');
    if (setActiveTab) {
      setTimeout(() => {
        setActiveTab('sql-terminal');
      }, 100);
    }
  };

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
    System.out.println("Listed all storage buckets.");
  }
}`
    },
    {
      tab: "Node.js",
      language: "javascript",
      code: `const {Storage} = require('@google-cloud/storage');

async function authenticateImplicitWithAdc() {
  // Construct client without explicit credentials.
  // The library will automatically look for credentials using ADC.
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
    # Construct a Storage Client using application default credentials (ADC)
    storage_client = storage.Client(project=project_id)

    buckets = list(storage_client.list_buckets())
    print("Buckets:")
    for bucket in buckets:
        print(bucket.name)
    print("Listed all storage buckets.")`
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
	// Storage client will automatically use Application Default Credentials.
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
			log.Fatalf("Failed to iterate buckets: %v", err)
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
        Console.WriteLine($"Text: {text}");
        Sentiment sentiment = response.DocumentSentiment;
        Console.WriteLine($"Sentiment: {sentiment.Score}, {sentiment.Magnitude}");
        Console.WriteLine("Successfully authenticated using the API key");
    }
}`
    },
    {
      tab: "Node.js",
      language: "javascript",
      code: `const {LanguageServiceClient} = require('@google-cloud/language');

async function analyzeSentiment(apiKey) {
  // Construct client passing API Key directly
  const client = new LanguageServiceClient({ apiKey });

  const text = 'Hello, world!';
  const [response] = await client.analyzeSentiment({
    document: { content: text, type: 'PLAIN_TEXT' }
  });

  const sentiment = response.documentSentiment;
  console.log(\`Sentiment Score: \${sentiment.score}\`);
  console.log("Successfully authenticated using the API key");
}`
    },
    {
      tab: "Python",
      language: "python",
      code: `from google.cloud import language_v1

def analyze_sentiment(api_key):
    client = language_v1.LanguageServiceClient(
        client_options={"api_key": api_key}
    )
    document = {"content": "Hello, world!", "type_": language_v1.Document.Type.PLAIN_TEXT}
    response = client.analyze_sentiment(request={"document": document})
    
    sentiment = response.document_sentiment
    print(f"Sentiment score: {sentiment.score}")
    print("Successfully authenticated using the API key")`
    },
    {
      tab: "Go",
      language: "go",
      code: `package main

import (
	"context"
	"fmt"
	"log"

	language "cloud.google.com/go/language/apiv1"
	"google.golang.org/api/option"
	languagepb "google.golang.org/genproto/googleapis/cloud/language/v1"
)

func main() {
	ctx := context.Background()
	apiKey := "your-api-key"
	
	// Create client using the API Key option.
	client, err := language.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	defer client.Close()

	// Perform sentiment analysis...
}`
    }
  ];

  return (
    <div className="flex-1 flex bg-[#07070a] text-slate-100 font-sans overflow-hidden select-none relative" style={{ height: "calc(100vh - 48px)" }}>
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <style>{`
        .glass-panel-dark {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .premium-btn {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          box-shadow: 0 4px 15px -3px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .premium-btn:hover {
          box-shadow: 0 8px 25px -4px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
      `}</style>

      {/* 1. Left Activity Bar - Sleek Dark */}
      <div className="w-14 bg-[#0a0a0f]/80 backdrop-blur-xl border-r border-indigo-500/10 flex flex-col justify-between py-4 items-center shrink-0 z-10">
        <div className="flex flex-col gap-6 items-center w-full">
          {/* Explorer Icon (Active) */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer w-full flex justify-center py-2 border-l-2 border-indigo-500 tooltip-trigger"
            title="Open ZIP Archive"
          >
            <FolderOpen className="h-[22px] w-[22px] text-indigo-400 transition-transform group-hover:scale-110" />
          </div>
          {/* Search Icon */}
          <div 
            onClick={() => gitInputRef.current?.focus()}
            className="relative group cursor-pointer w-full flex justify-center py-2 text-slate-500 hover:text-slate-300 transition-colors"
            title="Search / Clone Repo"
          >
            <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          {/* Source Control Icon */}
          <div 
            onClick={() => gitInputRef.current?.focus()}
            className="relative group cursor-pointer w-full flex justify-center py-2 text-slate-500 hover:text-slate-300 transition-colors"
            title="Git Repository"
          >
            <GitBranch className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          {/* Run & Debug */}
          <div 
            onClick={() => handleLoadSampleProject('ecommerce')}
            className="relative group cursor-pointer w-full flex justify-center py-2 text-slate-500 hover:text-slate-300 transition-colors"
            title="Run eCommerce Sample"
          >
            <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
        </div>
        <div className="flex flex-col gap-6 items-center w-full">
          {/* SQL Terminal Icon */}
          <div 
            onClick={handleTerminalClick}
            className="relative group cursor-pointer w-full flex justify-center py-2 text-slate-500 hover:text-slate-300 transition-colors"
            title="Open SQL Sandbox Terminal"
          >
            <Terminal className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          {/* Settings Icon */}
          <div 
            onClick={() => setShowSettings?.(true)}
            className="relative group cursor-pointer w-full flex justify-center py-2 text-slate-500 hover:text-slate-300 transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
        </div>
      </div>

      {/* 2. Side Explorer Pane */}
      <div className="w-64 bg-[#0c0e14]/60 backdrop-blur-md border-r border-indigo-500/10 flex flex-col shrink-0 font-sans z-10">
        <div className="p-4 border-b border-indigo-500/10 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>Workspace</span>
        </div>
        <div className="p-4 leading-relaxed flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-400 flex items-center gap-2 uppercase text-[10px] tracking-widest mb-3">
              No Project Active
            </div>
            <div className="text-slate-500 mb-5 text-xs">
              Open a workspace to initialize the intelligence scanning engine.
            </div>
            <div>
              <label className="block w-full text-center premium-btn text-white py-2 px-4 rounded-lg font-bold cursor-pointer transition-all active:scale-[0.98] text-xs">
                Upload ZIP Archive
                <input ref={fileInputRef} type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="border-t border-indigo-500/10 pt-4 text-[10px] text-slate-500 font-mono">
            <div className="flex justify-between mb-2">
              <span>Engine State</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</span>
            </div>
            <div className="flex justify-between">
              <span>Security Level</span>
              <span className="text-indigo-400 font-semibold">Max (OWASP-10)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col bg-transparent overflow-y-auto relative z-10"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && file.name.endsWith(".zip")) {
            const mockEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            await handleZipUpload(mockEvent);
          }
        }}
      >
        {/* Editor Tab Headers */}
        <div className="h-10 bg-[#0c0e14]/80 backdrop-blur-md flex border-b border-indigo-500/10 shrink-0">
          <div className="glass-panel-dark text-white px-5 flex items-center gap-2 border-r border-indigo-500/10 text-xs font-semibold h-full cursor-default border-t-2 border-t-indigo-500 shadow-sm">
            <Code className="h-4 w-4 text-indigo-400" />
            <span>Welcome - CodeScope</span>
            <span className="text-[10px] text-slate-500 hover:text-white cursor-pointer ml-3">×</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-10 py-12 flex flex-col justify-between">
          <div>
            {/* Header Title */}
            <div className="border-b border-indigo-500/10 pb-8 mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3 tracking-tight">
                  Start Analysis
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20 font-bold uppercase tracking-widest shadow-sm">
                    Engine v2.4
                  </span>
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                  Enterprise-grade static codebase analysis and OWASP-10 vulnerability scanner.
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-xs glass-panel-dark px-4 py-2 rounded-xl text-indigo-300 font-mono shadow-md">
                <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
                <span>SonarQube Rules Active</span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Start Options */}
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FolderOpen className="w-5 h-5 text-indigo-400" /> Import Workspace</h3>
                  
                  <div className="flex flex-col gap-4">
                    {/* Open ZIP Link */}
                    <label className="flex items-center gap-5 p-5 rounded-2xl glass-panel-dark group cursor-pointer transition-all border border-indigo-500/10 hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5">
                      <div className="bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 p-4 rounded-xl transition-colors">
                        <FolderOpen className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <span className="text-white group-hover:text-indigo-300 font-bold text-sm block transition-colors">Upload ZIP Archive</span>
                        <span className="text-xs text-slate-400 mt-1 block">Drop a local project zip archive to parse AST</span>
                      </div>
                      <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
                    </label>

                    {/* Clone Repository Option */}
                    <div className="p-5 rounded-2xl glass-panel-dark border border-indigo-500/10 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl">
                          <GitBranch className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-white font-bold text-sm block">Clone Git Repository</span>
                          <span className="text-xs text-slate-400 mt-1 block">Analyze directly from GitHub/GitLab</span>
                        </div>
                      </div>
                      <form onSubmit={handleGitImport} className="flex gap-2 mt-2">
                        <input 
                          ref={gitInputRef}
                          type="url" 
                          placeholder="https://github.com/user/repo.git"
                          value={gitRepoUrl}
                          onChange={(e) => setGitRepoUrl(e.target.value)}
                          className="flex-1 bg-slate-950/50 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors shadow-inner"
                          required
                        />
                        <button 
                          type="submit"
                          className="premium-btn text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          Clone
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Samples Section */}
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Or Try a Sandbox Template</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'ecommerce', name: 'Spring Boot E-Commerce', tag: 'Java • DDD', color: 'bg-orange-500' },
                      { id: 'microservice', name: 'Laravel CMS Backend', tag: 'PHP • MVC', color: 'bg-blue-500' },
                      { id: 'fintech', name: 'Express + Prisma Fintech API', tag: 'TypeScript • N-Tier', color: 'bg-teal-500' }
                    ].map(sample => (
                      <button 
                        key={sample.id}
                        onClick={() => handleLoadSampleProject(sample.id as any)}
                        className="w-full text-left p-4 glass-panel-dark hover:bg-slate-800/50 border border-indigo-500/10 hover:border-indigo-500/30 rounded-xl transition-all flex justify-between items-center group cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="flex gap-4 items-center">
                          <span className={`h-2.5 w-2.5 rounded-full ${sample.color} shadow-[0_0_10px_currentColor] opacity-80`} />
                          <div>
                            <span className="text-white text-sm font-semibold block">{sample.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono mt-1 block">{sample.tag}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Workspaces */}
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><History className="w-5 h-5 text-emerald-400" /> Recent Workspaces</h3>
                  
                  {recentProjects && recentProjects.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {recentProjects.map((p) => (
                        <div 
                          key={p.projectName}
                          onClick={() => handleSelectRecentProject(p.projectName)}
                          className="p-4 glass-panel-dark hover:bg-slate-800/60 border border-indigo-500/10 hover:border-indigo-500/40 rounded-xl transition-all flex items-center justify-between group cursor-pointer hover:shadow-lg"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="bg-slate-900 group-hover:bg-indigo-500/10 text-slate-400 group-hover:text-indigo-400 p-3 rounded-xl shrink-0 transition-colors">
                              <FileArchive className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-white text-sm font-bold block truncate">{p.projectName}</span>
                              <span className="text-[11px] text-slate-400 block mt-1 truncate">
                                Health Score: <strong className="text-indigo-400">{p.healthScore}%</strong> • {p.issuesCount} issues
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold tracking-widest bg-slate-900 border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                            RESTORE
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-slate-700 border-dashed rounded-2xl p-10 text-center text-slate-500 text-sm bg-slate-900/20 backdrop-blur-sm">
                      <History className="h-10 w-10 mx-auto mb-4 opacity-40 text-indigo-400 animate-pulse" />
                      No recent projects. Upload your first workspace to register analysis profiles.
                    </div>
                  )}
                </div>

                {/* Capabilities Info Board */}
                <div className="glass-panel-dark border border-indigo-500/10 p-6 rounded-2xl flex flex-col gap-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                    Engine Capabilities
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-xs text-slate-300">
                    <div className="flex gap-3">
                      <div className="text-indigo-400 font-black shrink-0 bg-indigo-500/10 px-1.5 rounded h-fit">01</div>
                      <p className="leading-relaxed">
                        <strong className="text-white">Architecture Mapper:</strong> Automatically detects DDD, Clean, MVC layouts and constructs visual call graphs.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-emerald-400 font-black shrink-0 bg-emerald-500/10 px-1.5 rounded h-fit">02</div>
                      <p className="leading-relaxed">
                        <strong className="text-white">API Explorer:</strong> Extracts controller endpoints and launches fully simulated HTTP runtime pipelines.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-rose-400 font-black shrink-0 bg-rose-500/10 px-1.5 rounded h-fit">03</div>
                      <p className="leading-relaxed">
                        <strong className="text-white">Security & Autofix:</strong> Discovers OWASP Top 10 vulnerabilities, N+1 leaks, and applies localized code repairs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* GCP Authentication & API Key Guides */}
            <div className="mt-16 border-t border-indigo-500/10 pt-10 text-left">
              <h2 className="text-lg font-black text-white mb-2 tracking-tight flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" />
                Google Cloud Authentication Guide
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Dowiedz się jak poprawnie skonfigurować autentykację dla bibliotek Google Cloud w swoich projektach.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-bold text-slate-350 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    1. Application Default Credentials (ADC)
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Inicjalizowanie klienta bez jawnego przekazywania klucza. Biblioteka automatycznie wykryje dane logowania z Twojego lokalnego środowiska deweloperskiego.
                  </p>
                  <TabbedCodeBlock 
                    title="ADC Implicit Authentication examples"
                    snippets={adcSnippets} 
                  />
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-slate-350 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    2. Use API keys with client libraries
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Przekazanie klucza API bezpośrednio w kodzie podczas tworzenia obiektu klienta (wspierane przez niektóre API jak np. Cloud Natural Language API).
                  </p>
                  <TabbedCodeBlock 
                    title="Explicit API Key auth examples"
                    snippets={apiKeySnippets} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tips / Bottom Section */}
          <div className="mt-14 pt-6 border-t border-indigo-500/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2.5 glass-panel-dark py-2 px-4 rounded-full border border-indigo-500/10">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span>Looking for help? Drag a zip folder anywhere to initiate scanning.</span>
            </div>
            <div className="flex gap-4 font-mono text-[10px] text-slate-600">
              <span>[v2.4.0-Enterprise]</span>
              <span>[Node.js Engine]</span>
            </div>
          </div>
        </div>

        {/* Drag Over Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#07070a]/80 backdrop-blur-md border-4 border-dashed border-indigo-500 flex flex-col items-center justify-center pointer-events-none z-50">
            <div className="bg-indigo-500/20 p-8 rounded-full mb-6">
              <UploadCloud className="h-20 w-20 text-indigo-400 animate-bounce" />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight mb-2">Drop ZIP to Analyze</h3>
            <p className="text-sm text-slate-400 font-mono">Extracts AST tree and initializes dynamic analysis</p>
          </div>
        )}
      </div>

      {/* 4. Bottom Status Bar - Sleek Dark */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#0a0a0f] text-slate-400 flex justify-between items-center px-3 text-[10px] select-none font-mono z-50 border-t border-indigo-500/20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
            <Cpu className="h-3 w-3 text-emerald-400" />
            <span>Engine: Ready</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
            <GitBranch className="h-3 w-3" />
            <span>main</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>TypeScript JSX</span>
        </div>
      </div>
    </div>
  );
};
