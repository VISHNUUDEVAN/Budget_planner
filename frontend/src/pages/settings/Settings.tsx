import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../../components/GlassCard';
import { Sun, Moon, Monitor, Shield, Eye, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Settings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Light Theme', icon: Sun, desc: 'Classic bright look for high-visibility environments.' },
    { value: 'dark' as const, label: 'Dark Theme', icon: Moon, desc: 'Sophisticated dark look to reduce glare and eye strain.' },
    { value: 'system' as const, label: 'System Theme', icon: Monitor, desc: 'Syncs automatically with your device settings.' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white">
          Application Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure interface displays, display themes, and dashboard preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Theme Preferences */}
          <GlassCard className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">Appearance</h2>
              <p className="text-xs text-slate-400 mt-1">Select the theme that fits your preferences.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themes.map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-300',
                      isSelected
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 shadow-md ring-2 ring-primary-500/20 translate-y-[-2px]'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shadow-md mb-3 text-white',
                      t.value === 'light' ? 'bg-gradient-to-tr from-amber-400 to-orange-500' :
                      t.value === 'dark' ? 'bg-gradient-to-tr from-indigo-500 to-primary-600' :
                      'bg-gradient-to-tr from-slate-500 to-slate-700'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mb-1">{t.label}</span>
                    <span className="text-[10px] text-slate-400 leading-snug">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Privacy & Security stub */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary-500" />
              <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">Security & Privacy</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your financial records are fully encrypted and stored locally. Sessions automatically terminate after 7 days of inactivity.
            </p>
            <div className="flex gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-slate-400" /> Data Encryption Active</span>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Help Card */}
        <div className="space-y-6">
          <GlassCard className="p-6 flex flex-col justify-between h-full bg-gradient-to-b from-primary-500/5 to-secondary-500/5">
            <div className="space-y-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-500 w-fit rounded-2xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-slate-800 dark:text-white text-md">Need Help?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If you encounter any layout issues, display glitches, or connection drops, try resetting the local cache or contact our support assistant at support@smartfinance.com.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6 flex justify-end">
              <a
                href="mailto:support@smartfinance.com"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Get Support
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
export default Settings;
