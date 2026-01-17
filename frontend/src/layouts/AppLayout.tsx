import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/app/Sidebar';
import { MobileNav } from '@/components/app/MobileNav';
import { TopBar } from '@/components/app/TopBar';
import { BioFeedbackPanel } from '@/components/app/BioFeedbackPanel';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Suspense } from 'react';
import { ContentLoader } from '@/components/app/ContentLoader';

export function AppLayout() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={`min-h-screen bg-background w-full flex flex-col md:grid transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'md:grid-cols-[64px_1fr]' : 'md:grid-cols-[240px_1fr]'}
        ${isSidebarCollapsed ? 'xl:grid-cols-[64px_1fr_320px]' : 'xl:grid-cols-[240px_1fr_320px]'}`}
    >
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top Bar (Hidden on xl+ where BioPanel is visible) */}
        <TopBar onOpenPanel={() => setIsPanelOpen(true)} />

        {/* Page Content with padding for mobile nav */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <AnimatePresence mode="wait" initial={false}>
            <Suspense fallback={<ContentLoader />}>
              <Outlet key={location.pathname} />
            </Suspense>
          </AnimatePresence>
        </main>
      </div>

      {/* Desktop Right Panel (Only visible on xl+ breakpoint) */}
      <aside className="hidden xl:flex flex-col border-l border-border bg-card p-4 overflow-y-auto">
        <BioFeedbackPanel />
      </aside>

      {/* Mobile/Tablet Sheet */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent side="right" className="w-[320px] p-4">
          <BioFeedbackPanel />
        </SheetContent>
      </Sheet>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
