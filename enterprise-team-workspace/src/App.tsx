/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FirebaseTeamProvider, useFirebaseTeam } from "./features/team/context/FirebaseTeamContext";
import { AuthScreen } from "./features/team/components/AuthScreen";
import { SetupWorkspaceScreen } from "./features/team/components/SetupWorkspaceScreen";
import Dashboard from "./features/team/pages/dashboard";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";

function MainAppContent() {
  const { user, teamId, authLoading, teamLoading } = useFirebaseTeam();

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-xxs">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-xs text-slate-500 font-medium animate-pulse">Łączenie z klastrem bezpieczeństwa Synthetix...</p>
      </div>
    );
  }

  // 2. Unauthenticated state -> AuthScreen
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Authenticated but no team associated -> SetupWorkspaceScreen
  if (!teamId) {
    return <SetupWorkspaceScreen />;
  }

  // 4. Fully Authenticated and has workspace -> Dashboard
  return <Dashboard />;
}

export default function App() {
  return (
    <FirebaseTeamProvider>
      <Toaster richColors position="top-right" closeButton />
      <MainAppContent />
    </FirebaseTeamProvider>
  );
}
