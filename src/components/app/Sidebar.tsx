import { Home, BookText, Heart, BarChart3, Settings, PanelLeft, PanelLeftClose, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useAuth } from '@/context/AuthContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/app/dashboard' },
  { icon: BookText, label: 'Journal', path: '/app/journal' },
  { icon: Heart, label: 'Calm', path: '/app/calm' },
  { icon: BarChart3, label: 'Insights', path: '/app/insights' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-300",
        "w-full"
      )}
    >
      {/* App Header / Logo */}
      <div className="h-16 flex items-center px-3 border-b border-border mb-2">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <img src="/logo.svg" alt="Sakina" className="w-8 h-8" />
        </div>
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out ml-2",
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}>
          <span className="text-xl font-bold tracking-tight">Sakina</span>
        </div>
      </div>

      <nav className="flex flex-col gap-2 py-2 flex-1 px-3" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center transition-all duration-200 group h-10 rounded-md',
                'hover:bg-accent/50',
                active && 'bg-accent text-primary'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* 
                 Icon Container: Fixed width to ensure stability.
                 w-10 matches the collapsed width behavior visually within the padding.
                 flex shrink-0 prevents it from squashing.
                 justify-center centers the icon within this 40px block.
              */}
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <Icon className={cn("w-5 h-5", active && "text-primary")} aria-hidden="true" />
              </div>

              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-2"
              )}>
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: Sign Out and Collapse Toggle */}
      <div className="border-t border-border">
        {/* Sign Out Button */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn(
              "hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full",
              isCollapsed ? "w-10 h-10 rounded-md p-0 justify-center" : "flex items-center justify-start px-3"
            )}
            aria-label="Sign out"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-sm font-medium overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              Sign Out
            </span>
          </Button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "hover:bg-accent/50 transition-all duration-300",
              isCollapsed ? "w-10 h-10 rounded-md p-0" : "w-full flex items-center justify-between px-3"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className={cn(
              "text-sm font-medium overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              Collapse
            </span>
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
