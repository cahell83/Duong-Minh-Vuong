import React, { useState } from 'react';
import { PickleballProvider } from './context/PickleballContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ScheduleList } from './components/ScheduleList';
import { LeaderboardView } from './components/LeaderboardView';
import { HallOfFame } from './components/HallOfFame';
import { SessionRegistration } from './components/SessionRegistration';
import { AdminSettings } from './components/AdminSettings';
import { MobileBottomNav } from './components/MobileBottomNav';

function PickleballApp() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'schedule' | 'rankings' | 'honor' | 'registration' | 'settings'
  >('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-lime-400 selection:text-slate-950">
      {/* Sticky Header with Role Switcher & Desktop Nav */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area: with bottom padding for mobile toolbar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8">
        {activeTab === 'home' && (
          <HomeView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'schedule' && <ScheduleList />}
        {activeTab === 'rankings' && <LeaderboardView />}
        {activeTab === 'honor' && <HallOfFame />}
        {activeTab === 'registration' && (
          <SessionRegistration onGoToLive={() => setActiveTab('schedule')} />
        )}
        {activeTab === 'settings' && (
          <AdminSettings onScheduleGenerated={() => setActiveTab('schedule')} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 mb-16 md:mb-0 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-lime-400 flex items-center gap-1.5">
              <span>🐶</span>
              <span>PICKLEBALL CÚN CƯNG</span>
            </span>
            <span>•</span>
            <span>CLB Chia Trận Ngẫu Nhiên, Cân Bằng DUPR & Ghi Sổ Điểm</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>✓ Chuẩn 4 Nam, 4 Nữ, Nam Nữ</span>
            <span>•</span>
            <span>✓ Nghỉ 1 trận xen kẽ</span>
            <span>•</span>
            <span>✓ Bảng xếp hạng Tuần/Tháng/Năm</span>
          </div>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Toolbar (Thanh công cụ điều hướng dưới cho mobile) */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <PickleballProvider>
      <PickleballApp />
    </PickleballProvider>
  );
}
