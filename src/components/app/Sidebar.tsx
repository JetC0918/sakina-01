import { Home, BookText, Heart, BarChart3, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

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

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="hidden md:flex flex-col w-16 border-r border-border bg-sidebar h-full">
      <nav className="flex flex-col items-center gap-2 py-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
                'hover:bg-accent/50',
                active && 'bg-accent text-primary'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
