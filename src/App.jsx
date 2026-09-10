import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from '@/components/dashboard/ThemeContext';
import RequireAuth from '@/components/dashboard/RequireAuth';
import AppLayout from '@/components/dashboard/AppLayout';
import Login from '@/pages/Login';
import Overview from '@/pages/Overview';
import Home from '@/pages/Home';
import Notes from '@/pages/Notes';
import ActivityLog from '@/pages/ActivityLog';
import OnlineUsers from '@/pages/OnlineUsers';
import CustomFeaturePage from '@/pages/CustomFeaturePage';
import FilesCS from '@/pages/FilesCS';
import Analyzer from '@/pages/Analyzer';
import Predict from '@/pages/Predict';
import Shortcut from '@/pages/Shortcut';
import Ticket from '@/pages/Ticket';
import Win from '@/pages/Win';
import Bank from '@/pages/Bank';
import Rrn from '@/pages/Rrn';
import ResultTogel from '@/pages/ResultTogel';
import AccountValidation from '@/pages/AccountValidation';
import ChatMistakeArchive from '@/pages/ChatMistakeArchive';
import HlxPro from '@/pages/HlxPro';
import Settings from '@/pages/Settings';
import Chat from '@/pages/Chat';
import CodeFilter from '@/pages/CodeFilter';
import AutoScreenshot from '@/pages/AutoScreenshot';
import UserCenter from '@/pages/UserCenter';
import ExtensionSuite from '@/pages/ExtensionSuite';
import BetCalculator from '@/pages/BetCalculator';
import ParlayCalculator from '@/pages/ParlayCalculator';
import TogelCalculator from '@/pages/TogelCalculator';
import KpbiLive from '@/pages/KpbiLive';
import KpbiCek from '@/pages/KpbiCek';
import TransactionLog from '@/pages/TransactionLog';
import MaintenancePage from '@/components/dashboard/MaintenancePage';
import PhoneCheck from '@/pages/PhoneCheck';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route path="/" element={<Overview />} />
                <Route path="/dashboard" element={<Home />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/activity" element={<ActivityLog />} />
                <Route path="/permissions" element={<UserCenter />} />
                <Route path="/roles" element={<UserCenter />} />
                <Route path="/online" element={<OnlineUsers />} />
                <Route path="/feature-builder" element={<Settings />} />
                <Route path="/security" element={<Settings />} />
                <Route path="/feature/:slug" element={<CustomFeaturePage />} />
                <Route path="/files" element={<FilesCS />} />
                <Route path="/analyzer" element={<MaintenancePage title="Free Spin Analyzer" color="var(--acc-2)" />} />
                <Route path="/predict" element={<Predict />} />
                <Route path="/shortcut" element={<Shortcut />} />
                <Route path="/ticket" element={<Ticket />} />
                <Route path="/win" element={<Win />} />
                <Route path="/bank" element={<Bank />} />
                <Route path="/rrn" element={<Rrn />} />
                <Route path="/code-filter" element={<MaintenancePage title="Filter Kode Game" color="var(--acc-2)" />} />
                <Route path="/auto-screenshot" element={<AutoScreenshot />} />
                <Route path="/result-togel" element={<ResultTogel />} />
                <Route path="/validasi" element={<AccountValidation />} />
                <Route path="/arsip-chat" element={<ChatMistakeArchive />} />
                <Route path="/hlxpro" element={<MaintenancePage title="AI Chat" color="var(--acc-2)" />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<UserCenter />} />
              <Route path="/extension-suite" element={<ExtensionSuite />} />
              <Route path="/bet-calc" element={<BetCalculator />} />
              <Route path="/parlay-calc" element={<ParlayCalculator />} />
              <Route path="/togel-calc" element={<TogelCalculator />} />
              <Route path="/kpbi-live" element={<MaintenancePage title="KPBI Live" color="var(--acc-2)" />} />
              <Route path="/kpbi-cek" element={<MaintenancePage title="KPBI Cek Member" color="var(--acc-2)" />} />
              <Route path="/transaction-log" element={<TransactionLog />} />
              <Route path="/user-approvals" element={<UserCenter />} />
              <Route path="/cek-hp" element={<PhoneCheck />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
          <SonnerToaster position="top-center" theme="dark" richColors />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App