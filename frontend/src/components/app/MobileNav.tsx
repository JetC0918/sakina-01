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

          let activeStyle = "bg-primary/20 text-primary-foreground"; // Default fallback

          if (active) {
            switch (item.label) {
              case 'Home':
                activeStyle = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
                break;
              case 'Journal':
                activeStyle = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
                break;
              case 'Calm':
                activeStyle = "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
                break;
              case 'Insights':
                activeStyle = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
                break;
              default:
                activeStyle = "bg-accent text-accent-foreground";
            }
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200',
                'hover:bg-accent/50 min-w-[60px] min-h-[50px]', // Increased width for better touch target with background
                active && activeStyle
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
