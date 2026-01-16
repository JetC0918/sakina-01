import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/app/Sidebar';
import { MobileNav } from '@/components/app/MobileNav';
import { TopBar } from '@/components/app/TopBar';
import { BioFeedbackPanel } from '@/components/app/BioFeedbackPanel';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function AppLayout() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background w-full flex flex-col md:grid md:grid-cols-[64px_1fr] lg:grid-cols-[64px_1fr_320px]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Top Bar (Mobile/Tablet only) */}
        <TopBar onOpenPanel={() => setIsPanelOpen(true)} />

        {/* Page Content with padding for mobile nav */}
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Desktop Right Panel */}
      <aside className="hidden lg:flex flex-col border-l border-border bg-card p-4 overflow-y-auto">
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
