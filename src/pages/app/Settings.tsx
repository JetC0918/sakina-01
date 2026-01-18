import { useId } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSakina } from '@/hooks/useSakina';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Palette, Bell, CreditCard, Sun, Moon, Laptop, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/PageTransition';
import type { Theme, Language } from '@/types/sakina';
import type { LucideIcon } from 'lucide-react';

// Section Header Component
interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

// Theme Selector Component
function ThemeSelector() {
  const { state, actions } = useSakina();

  const themes = [
    { value: 'light' as Theme, icon: Sun, label: 'Light' },
    { value: 'dark' as Theme, icon: Moon, label: 'Dark' },
    { value: 'system' as Theme, icon: Laptop, label: 'System' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-base font-medium">Theme</p>
      <RadioGroup
        value={state.preferences.theme}
        onValueChange={(value) => actions.setTheme(value as Theme)}
        className="grid grid-cols-3 gap-3"
      >
        {themes.map(({ value, icon: Icon, label }) => (
          <div key={value}>
            <RadioGroupItem value={value} id={`theme-${value}`} className="peer sr-only" />
            <Label
              htmlFor={`theme-${value}`}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent cursor-pointer transition-all"
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

// Language Switcher Component
function LanguageSwitcher() {
  const { state, actions } = useSakina();

  const languages = [
    { value: 'en' as Language, label: 'English' },
    { value: 'ar' as Language, label: 'العربية' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-base font-medium">Language</p>
      <RadioGroup
        value={state.preferences.language}
        onValueChange={(value) => actions.setLanguage(value as Language)}
        className="grid grid-cols-2 gap-3"
      >
        {languages.map(({ value, label }) => (
          <div key={value}>
            <RadioGroupItem value={value} id={`lang-${value}`} className="peer sr-only" />
            <Label
              htmlFor={`lang-${value}`}
              className="flex items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent cursor-pointer transition-all"
            >
              <span className="text-sm font-medium">{label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

// Switch Row Component
interface SwitchRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SwitchRow({ label, description, checked, onCheckedChange }: SwitchRowProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5 flex-1">
        <Label htmlFor={id} className="text-base cursor-pointer">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// Main Settings Page
// Main Settings Page
export default function Settings() {
  const { state, actions } = useSakina();
  const { signOut } = useAuth();
  const { preferences } = state;

  const handleLogout = async () => {
    await signOut();
    actions.logout();
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-0">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Sakina experience.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Appearance */}
          <Card className="p-6 space-y-6">
            <SectionHeader icon={Palette} title="Appearance" />
            <ThemeSelector />
            <LanguageSwitcher />
          </Card>

          {/* Card 2: Notifications */}
          <Card className="p-6 space-y-6">
            <SectionHeader icon={Bell} title="Notifications" />
            <SwitchRow
              label="AI Nudges"
              description="Receive gentle interventions when stress is detected"
              checked={preferences.notifications.nudges}
              onCheckedChange={(checked) =>
                actions.updateNotificationPreferences({ nudges: checked })
              }
            />
            <SwitchRow
              label="Daily Reminder"
              description="Get reminded to journal once per day"
              checked={preferences.notifications.dailyReminder}
              onCheckedChange={(checked) =>
                actions.updateNotificationPreferences({ dailyReminder: checked })
              }
            />
          </Card>

          {/* Card 3: Account (Full Width) */}
          <Card className="p-6 md:col-span-2 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Subscription Plan</h3>
              <p className="text-sm text-muted-foreground">
                {preferences.subscription === 'premium'
                  ? 'Enjoy unlimited features and advanced insights'
                  : 'Upgrade to Premium for advanced analytics and unlimited interventions'}
              </p>
            </div>
            <Badge variant={preferences.subscription === 'premium' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
              {preferences.subscription === 'premium' ? 'Premium' : 'Free'}
            </Badge>
          </Card>
        </div>

        {/* Logout Button */}
        <div className="md:hidden">
          <Card
            className="p-4 flex items-center justify-center gap-2 text-destructive cursor-pointer hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Log Out</span>
          </Card>
        </div>

        <div className="hidden md:flex justify-end">
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>

      </div>
    </PageTransition>
  );
}
