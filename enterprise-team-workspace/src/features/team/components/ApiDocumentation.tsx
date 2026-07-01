import { useState } from "react";
import { 
  BookOpen, Code, Terminal, Play, Check, Copy, 
  Send, Server, KeyRound, Cpu, ShieldAlert, Zap
} from "lucide-react";
import { toast } from "sonner";

interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "DELETE" | "PUT";
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  sampleCurl: string;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: "sso-auth",
    method: "POST",
    path: "/api/v1/auth/sso",
    description: "Uwierzytelnianie SSO i federacyjny uścisk dłoni JWT.",
    requestBody: `{
  "clientId": "client_live_9b28fa2c30a",
  "clientSecret": "sk_live_9a12bc...",
  "grantType": "client_credentials",
  "mfaToken": "982310"
}`,
    responseBody: `{
  "status": "authorized",
  "token_type": "Bearer",
  "expires_in": 7200,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scopes": ["projects.read", "deployments.write"]
}`,
    sampleCurl: "curl -X POST https://api.synthetix.io/v1/auth/sso \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"clientId\":\"client_live_...\",\"clientSecret\":\"sk_live_...\"}'"
  },
  {
    id: "billing-charge",
    method: "POST",
    path: "/api/v1/billing/charge",
    description: "Obciążenie rachunku subskrypcyjnego przez bramkę płatniczą Stripe.",
    requestBody: `{
  "invoiceId": "inv_8023c9ab",
  "amount": 250000,
  "currency": "usd",
  "paymentMethod": "pm_card_visa"
}`,
    responseBody: `{
  "id": "chg_9c2830fba8c9",
  "object": "charge",
  "amount": 250000,
  "currency": "usd",
  "status": "succeeded",
  "receipt_url": "https://stripe.com/receipt/acct_192b0..."
}`,
    sampleCurl: "curl -X POST https://api.synthetix.io/v1/billing/charge \\\n  -H 'Authorization: Bearer sk_live_...' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"invoiceId\":\"inv_8023c9ab\",\"amount\":250000}'"
  },
  {
    id: "cluster-status",
    method: "GET",
    path: "/api/v1/cluster/status",
    description: "Monitorowanie stanu klastra mikrousług AWS w czasie rzeczywistym.",
    responseBody: `{
  "cluster_name": "Synthetix-Cluster-01",
  "status": "HEALTHY",
  "active_instances": 12,
  "cpu_utilization": "42.8%",
  "memory_utilization": "61.2%",
  "latency_p99_ms": 14.2
}`,
    sampleCurl: "curl -X GET https://api.synthetix.io/v1/cluster/status \\\n  -H 'Authorization: Bearer sk_live_...'"
  }
];

export function ApiDocumentation() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("sso-auth");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Interactive testing states
  const [testRequestBody, setTestRequestBody] = useState<string>("");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  const activeEndpoint = ENDPOINTS.find((e) => e.id === selectedEndpointId) || ENDPOINTS[0];

  // Sync test inputs when active endpoint changes
  useState(() => {
    setTestRequestBody(activeEndpoint.requestBody || "");
  });

  const handleEndpointSelect = (id: string) => {
    setSelectedEndpointId(id);
    const ep = ENDPOINTS.find((e) => e.id === id);
    setTestRequestBody(ep?.requestBody || "");
    setTestResponse(null);
    setTestLatency(null);
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Skopiowano do schowka!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteRequest = () => {
    if (isTesting) return;
    setIsTesting(true);
    setTestResponse(null);
    setTestLatency(null);
    toast.info(`Wysyłanie testowego żądania do ${activeEndpoint.path}...`);

    setTimeout(() => {
      setIsTesting(false);
      setTestLatency(Math.floor(Math.random() * 80) + 15);
      setTestResponse(activeEndpoint.responseBody);
      toast.success("Otrzymano odpowiedź HTTP 200 OK!");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <span>Przewodnik po Integracji API & SDK</span>
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xxs font-semibold text-indigo-700 border border-indigo-200">
            Developer Sandbox
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Używaj ujednoliconego interfejsu API klastra, testuj punkty końcowe i kompiluj niestandardowe biblioteki integracyjne SaaS w locie.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Sidebar endpoint selector */}
        <div className="md:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h3 className="text-xxs font-bold text-slate-400 uppercase tracking-widest mb-3">Punkty Końcowe (API)</h3>
            <div className="space-y-1">
              {ENDPOINTS.map((ep) => {
                const isActive = ep.id === selectedEndpointId;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleEndpointSelect(ep.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      ep.method === "GET" 
                        ? (isActive ? "bg-emerald-500/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-100")
                        : (isActive ? "bg-indigo-500/30 text-white" : "bg-indigo-50 text-indigo-700 border border-indigo-100")
                    }`}>
                      {ep.method}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold leading-none ${isActive ? "text-white" : "text-slate-800"}`}>{ep.path}</p>
                      <p className={`text-[10px] mt-1 truncate ${isActive ? "text-indigo-200" : "text-slate-400"}`}>{ep.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Documentation Content & Sandbox */}
        <div className="md:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xxs font-extrabold uppercase tracking-wide text-slate-400">PUNKT KOŃCOWY</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                    activeEndpoint.method === "GET" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  }`}>{activeEndpoint.method}</span>
                  <span className="font-mono text-sm font-bold text-slate-800">{activeEndpoint.path}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopyCode(activeEndpoint.sampleCurl, "curl")}
                className="h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xxs font-bold px-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {copiedId === "curl" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedId === "curl" ? "Skopiowano" : "Kopiuj cURL"}</span>
              </button>
            </div>

            {/* Description & Curl snippet */}
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">{activeEndpoint.description}</p>

            <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-300 relative overflow-x-auto">
              <span className="absolute top-2 right-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">cURL</span>
              <pre className="whitespace-pre-wrap">{activeEndpoint.sampleCurl}</pre>
            </div>

            {/* Sandbox tester split */}
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Interaktywny Endpoint Tester (Sandbox)</span>
                </h4>
                <button
                  onClick={handleExecuteRequest}
                  disabled={isTesting}
                  className="h-9 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold text-xs px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isTesting ? "Wykonuję..." : "Wyślij Żądanie"}</span>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Request Payload */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">Payload Żądania (Request JSON)</span>
                  {activeEndpoint.requestBody ? (
                    <textarea
                      value={testRequestBody}
                      onChange={(e) => setTestRequestBody(e.target.value)}
                      className="w-full h-44 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  ) : (
                    <div className="h-44 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                      <Cpu className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Metoda GET</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">To żądanie nie wymaga opcjonalnego nagłówka body.</p>
                    </div>
                  )}
                </div>

                {/* Response payload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Odpowiedź Serwera (Response JSON)</span>
                    {testLatency && (
                      <span className="text-[9px] font-mono text-emerald-600 font-bold">Latency: {testLatency}ms</span>
                    )}
                  </div>
                  {testResponse ? (
                    <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-emerald-400 h-44 overflow-y-auto relative">
                      <span className="absolute top-2 right-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans">HTTP 200 OK</span>
                      <pre>{testResponse}</pre>
                    </div>
                  ) : (
                    <div className="h-44 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                      {isTesting ? (
                        <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Terminal className="h-8 w-8 text-slate-300 mb-2" />
                          <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Oczekiwanie na żądanie</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Użyj przycisku "Wyślij Żądanie" u góry panelu testera.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
