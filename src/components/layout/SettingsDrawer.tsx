import React from "react";
import { Settings } from "lucide-react";

interface SettingsDrawerProps {
  settingsSeverity: string;
  setSettingsSeverity: (sev: string) => void;
  settingsArchMatch: number;
  setSettingsArchMatch: (match: number) => void;
  setShowSettings: (show: boolean) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  settingsSeverity,
  setSettingsSeverity,
  settingsArchMatch,
  setSettingsArchMatch,
  setShowSettings,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-indigo-500" /> CodeScope Analysis Configuration
        </h3>
        <p className="text-xs text-slate-500">Modify active threshold rules and AST verification constraints.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Scan Risk Minimum</label>
          <select 
            value={settingsSeverity}
            onChange={(e) => setSettingsSeverity(e.target.value)}
            className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Anomalies (Default)</option>
            <option value="High">High & Critical Only</option>
            <option value="Critical">Critical Only</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-500 mb-1 font-medium">Architecture Fit Threshold</label>
          <input 
            type="range" 
            min="50" 
            max="95" 
            value={settingsArchMatch}
            onChange={(e) => setSettingsArchMatch(Number(e.target.value))}
            className="accent-indigo-600 h-1"
          />
          <span className="ml-2 font-mono">{settingsArchMatch}%</span>
        </div>
        <button
          onClick={() => setShowSettings(false)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded font-semibold cursor-pointer"
        >
          Apply Rules
        </button>
      </div>
    </div>
  );
};
