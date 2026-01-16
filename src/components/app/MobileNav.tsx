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

export function MobileNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                'hover:bg-accent/50 min-w-[44px] min-h-[44px]',
                active && 'text-primary'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} aria-hidden="true" />
              <span className={cn('text-[10px]', active && 'font-semibold')}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
