import { useState } from 'react';
import {
  ClipboardList,
  FileDown,
  Globe,
  Home,
  PlusCircle,
  Wrench,
  Zap,
} from 'lucide-react';
import type { AppScreen, Language } from '../types/material';
import type { Translations } from '../i18n/translations';
import { cn } from '../utils/cn';

interface HeaderNavProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  lang: Language;
  onToggleLanguage: (lang: Language) => void;
  itemCount: number;
  onResetList: () => void;
  t: Translations;
}

export function HeaderNav({
  activeScreen,
  onNavigate,
  lang,
  onToggleLanguage,
  itemCount,
  onResetList,
  t,
}: HeaderNavProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const navItems: { id: AppScreen; label: string; icon: typeof Home }[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'electrical', label: t.navElectrical, icon: Zap },
    { id: 'plumbing', label: t.navPlumbing, icon: Wrench },
    {
      id: 'list',
      label: itemCount > 0 ? `${t.navList} (${itemCount})` : t.navList,
      icon: ClipboardList,
    },
    { id: 'pdf', label: t.navPdf, icon: FileDown },
  ];

  const handleNewListClick = () => {
    if (itemCount === 0) {
      onResetList();
      return;
    }
    setConfirmReset(true);
  };

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:gap-8">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex shrink-0 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label={t.brandName}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F294A] text-white sm:h-8 sm:w-8">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight text-[#0F294A] whitespace-nowrap sm:text-lg">
              {t.brandName}
            </span>
          </button>

          {/* Zone 2: Desktop single-line nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-6 md:flex"
          >
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600',
                    isActive
                      ? 'border-blue-700 text-[#0F294A] font-semibold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language selector + New List primary action */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <div
              role="group"
              aria-label={t.languageLabel}
              className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5"
            >
              <Globe className="ml-1.5 mr-1 hidden h-3.5 w-3.5 text-slate-500 sm:block" aria-hidden="true" />
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={cn(
                  'min-h-[30px] whitespace-nowrap shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors sm:min-h-[32px] sm:px-2.5 sm:text-xs',
                  lang === 'en'
                    ? 'bg-white text-[#0F294A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('ta')}
                className={cn(
                  'min-h-[30px] whitespace-nowrap shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors sm:min-h-[32px] sm:px-2.5 sm:text-xs',
                  lang === 'ta'
                    ? 'bg-white text-[#0F294A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                தமிழ்
              </button>
            </div>

            <button
              type="button"
              onClick={handleNewListClick}
              className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap shrink-0 rounded-lg bg-[#0F294A] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#173B68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-h-[38px] sm:gap-1.5 sm:px-4 sm:text-sm"
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
              <span>{t.newListBtn}</span>
            </button>
          </div>
        </div>

        {/* Inline confirmation bar for New List when items exist */}
        {confirmReset && (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-2.5">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm">
              <span className="font-medium text-amber-950">{t.confirmNewListPrompt}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReset(false);
                    onResetList();
                  }}
                  className="min-h-[36px] whitespace-nowrap rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  {t.confirmNewListYes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[36px] whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancelBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile bottom tab bar — compact 56px height keeping sticky total <= 15% of 844px mobile viewport */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="no-print fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
      >
        <div className="grid h-14 grid-cols-5 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'relative flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 transition-colors',
                  isActive ? 'text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="max-w-full truncate text-[10px] leading-tight">
                  {item.id === 'list'
                    ? itemCount > 0
                      ? `${lang === 'ta' ? 'பட்டியல்' : 'List'} (${itemCount})`
                      : lang === 'ta'
                        ? 'பட்டியல்'
                        : 'List'
                    : item.id === 'pdf'
                      ? 'PDF'
                      : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
