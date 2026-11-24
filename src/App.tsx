import { useState } from 'react';
import { Globe } from 'lucide-react';
import {
  DEFAULT_ELECTRICAL_BRANDS,
  DEFAULT_PLUMBING_BRANDS,
  ELECTRICAL_CATALOG,
  PLUMBING_CATALOG,
} from './data/catalog';
import { TRANSLATIONS } from './i18n/translations';
import type {
  AppScreen,
  CatalogCategory,
  CatalogItem,
  CustomCategory,
  Language,
  MaterialEntry,
  SiteDetails,
  TradeType,
} from './types/material';
import { createEmptySiteDetails } from './utils/calculations';
import { HeaderNav } from './components/HeaderNav';
import { HomeDashboard } from './components/HomeDashboard';
import { SiteDetailsForm } from './components/SiteDetailsForm';
import { CatalogBrowser } from './components/CatalogBrowser';
import {
  MaterialEntryModal,
  type MaterialModalTarget,
} from './components/MaterialEntryModal';
import { MaterialListSummary } from './components/MaterialListSummary';
import { PdfGeneratorScreen } from './components/PdfGeneratorScreen';

export default function App() {
  // Strictly temporary in-memory React state only (no localStorage, cookies, or DB)
  const [lang, setLang] = useState<Language>('en');
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home');
  const [pendingTrade, setPendingTrade] = useState<TradeType | null>(null);

  const [siteDetails, setSiteDetails] = useState<SiteDetails>(createEmptySiteDetails);
  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [electricalBrands, setElectricalBrands] = useState<string[]>(DEFAULT_ELECTRICAL_BRANDS);
  const [plumbingBrands, setPlumbingBrands] = useState<string[]>(DEFAULT_PLUMBING_BRANDS);

  const [modalTarget, setModalTarget] = useState<MaterialModalTarget | null>(null);

  const t = TRANSLATIONS[lang];

  const handleNavigate = (screen: AppScreen) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTrade = (trade: TradeType) => {
    const hasBasicDetails =
      siteDetails.preparedBy.trim().length > 0 &&
      siteDetails.mobileNumber.replace(/\D/g, '').length >= 10;

    if (!hasBasicDetails) {
      setPendingTrade(trade);
      handleNavigate('details');
      return;
    }
    handleNavigate(trade);
  };

  const handleStartNewListFromHome = () => {
    setPendingTrade('electrical');
    handleNavigate('details');
  };

  const handleSaveDetails = (updated: SiteDetails, nextTrade?: TradeType) => {
    setSiteDetails(updated);
    setPendingTrade(null);
    if (nextTrade) {
      handleNavigate(nextTrade);
    }
  };

  const handleAddBrand = (trade: TradeType, newBrand: string) => {
    const clean = newBrand.trim();
    if (!clean) return;
    const setter = trade === 'electrical' ? setElectricalBrands : setPlumbingBrands;
    setter((prev) => {
      if (prev.some((b) => b.toLowerCase() === clean.toLowerCase())) return prev;
      return [clean, ...prev];
    });
  };

  const handleRenameBrand = (trade: TradeType, oldBrand: string, newBrand: string) => {
    const clean = newBrand.trim();
    if (!clean) return;
    const setter = trade === 'electrical' ? setElectricalBrands : setPlumbingBrands;
    setter((prev) => prev.map((b) => (b === oldBrand ? clean : b)));
    setEntries((prev) =>
      prev.map((entry) =>
        entry.trade === trade && entry.brand === oldBrand
          ? { ...entry, brand: clean }
          : entry
      )
    );
  };

  const handleAddCustomCategory = (trade: TradeType, name: string): CustomCategory => {
    const clean = name.trim();
    const existing = customCategories.find(
      (c) => c.trade === trade && c.name.toLowerCase() === clean.toLowerCase()
    );
    if (existing) return existing;

    const created: CustomCategory = {
      id: `custom-cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      trade,
      name: clean,
    };
    setCustomCategories((prev) => [...prev, created]);
    return created;
  };

  const handleSelectCatalogItem = (category: CatalogCategory, item: CatalogItem) => {
    setModalTarget({
      mode: 'add',
      trade: category.trade,
      category,
      catalogItem: item,
    });
  };

  const handleOpenCustomModal = (trade: TradeType) => {
    setModalTarget({
      mode: 'custom',
      trade,
    });
  };

  const handleEditEntry = (entry: MaterialEntry) => {
    setModalTarget({
      mode: 'edit',
      trade: entry.trade,
      existingEntry: entry,
    });
  };

  const handleSubmitModal = (entryData: Omit<MaterialEntry, 'id'>, existingId?: string) => {
    if (existingId) {
      setEntries((prev) =>
        prev.map((item) => (item.id === existingId ? { ...entryData, id: existingId } : item))
      );
    } else {
      const created: MaterialEntry = {
        ...entryData,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      setEntries((prev) => [...prev, created]);
    }
    setModalTarget(null);
  };

  const handleUpdateQuantity = (id: string, nextQty: number) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: nextQty } : item))
    );
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearList = () => {
    setEntries([]);
  };

  const handleResetEntireList = () => {
    setEntries([]);
    setSiteDetails(createEmptySiteDetails());
    setCustomCategories([]);
    setElectricalBrands(DEFAULT_ELECTRICAL_BRANDS);
    setPlumbingBrands(DEFAULT_PLUMBING_BRANDS);
    setPendingTrade(null);
    handleNavigate('home');
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <HeaderNav
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        lang={lang}
        onToggleLanguage={setLang}
        itemCount={entries.length}
        onResetList={handleResetEntireList}
        t={t}
      />

      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-12 md:pt-8">
        {activeScreen === 'home' && (
          <HomeDashboard
            details={siteDetails}
            entries={entries}
            onStartTrade={handleStartTrade}
            onNavigate={handleNavigate}
            onStartNewList={handleStartNewListFromHome}
            t={t}
          />
        )}

        {activeScreen === 'details' && (
          <SiteDetailsForm
            details={siteDetails}
            pendingTrade={pendingTrade}
            lang={lang}
            t={t}
            onSave={handleSaveDetails}
          />
        )}

        {activeScreen === 'electrical' && (
          <CatalogBrowser
            trade="electrical"
            categories={ELECTRICAL_CATALOG}
            entries={entries}
            lang={lang}
            t={t}
            onSelectCatalogItem={handleSelectCatalogItem}
            onOpenCustomModal={handleOpenCustomModal}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'plumbing' && (
          <CatalogBrowser
            trade="plumbing"
            categories={PLUMBING_CATALOG}
            entries={entries}
            lang={lang}
            t={t}
            onSelectCatalogItem={handleSelectCatalogItem}
            onOpenCustomModal={handleOpenCustomModal}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'list' && (
          <MaterialListSummary
            entries={entries}
            t={t}
            onEditEntry={handleEditEntry}
            onUpdateQuantity={handleUpdateQuantity}
            onDeleteEntry={handleDeleteEntry}
            onClearList={handleClearList}
            onOpenCustomModal={handleOpenCustomModal}
            onNavigate={handleNavigate}
          />
        )}

        {activeScreen === 'pdf' && (
          <PdfGeneratorScreen
            details={siteDetails}
            entries={entries}
            lang={lang}
            t={t}
            onNavigate={handleNavigate}
            onResetList={handleResetEntireList}
          />
        )}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white px-4 py-6 pb-24 text-center text-slate-600 md:pb-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3">
          <p className="text-xs font-medium text-slate-500">{t.brandMotto}</p>

          <div className="w-full max-w-md border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              Designed &amp; Developed by{' '}
              <span className="mt-0.5 block text-sm font-semibold text-[#0F294A]">
                Lakshmanan
              </span>
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">
              UI/UX Designer &amp; AI Developer
            </p>

            <div className="mt-2.5 flex items-center justify-center gap-2.5">
              <a
                href="https://www.linkedin.com/in/lakshmanan-p-aba07133a/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Lakshmanan's LinkedIn profile"
                title="Visit Lakshmanan's LinkedIn profile"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[#0A66C2] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              <a
                href="https://spectacular-lebkuchen-72e0ed.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Lakshmanan's portfolio"
                title="View Lakshmanan's portfolio"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[#0F294A] transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-600/40 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">&copy; 2026. All rights reserved.</p>
        </div>
      </footer>

      {modalTarget && (
        <MaterialEntryModal
          target={modalTarget}
          categories={
            modalTarget.trade === 'electrical' ? ELECTRICAL_CATALOG : PLUMBING_CATALOG
          }
          customCategories={customCategories}
          brands={
            modalTarget.trade === 'electrical' ? electricalBrands : plumbingBrands
          }
          siteDetails={siteDetails}
          lang={lang}
          t={t}
          onAddCustomCategory={handleAddCustomCategory}
          onAddBrand={handleAddBrand}
          onRenameBrand={handleRenameBrand}
          onSubmit={handleSubmitModal}
          onClose={() => setModalTarget(null)}
        />
      )}
    </div>
  );
}
