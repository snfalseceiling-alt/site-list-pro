import { useState } from 'react';
import {
  Check,
  ClipboardList,
  Plus,
  Search,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type {
  AppScreen,
  CatalogCategory,
  CatalogItem,
  Language,
  MaterialEntry,
  TradeType,
} from '../types/material';
import { filterCatalog } from '../utils/calculations';
import { cn } from '../utils/cn';

interface CatalogBrowserProps {
  trade: TradeType;
  categories: CatalogCategory[];
  entries: MaterialEntry[];
  lang: Language;
  t: Translations;
  onSelectCatalogItem: (category: CatalogCategory, item: CatalogItem) => void;
  onOpenCustomModal: (trade: TradeType) => void;
  onNavigate: (screen: AppScreen) => void;
}

export function CatalogBrowser({
  trade,
  categories,
  entries,
  lang,
  t,
  onSelectCatalogItem,
  onOpenCustomModal,
  onNavigate,
}: CatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');

  const isElectrical = trade === 'electrical';
  const tradeEntries = entries.filter((e) => e.trade === trade);
  const filteredGroups = filterCatalog(categories, searchQuery, selectedCategoryId);

  const countInListForMaterial = (itemNameEn: string, itemNameTa: string) =>
    tradeEntries.filter(
      (entry) =>
        entry.materialName.toLowerCase() === itemNameEn.toLowerCase() ||
        entry.materialName.toLowerCase() === itemNameTa.toLowerCase()
    ).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Prominent + Add Custom Material CTA */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white',
              isElectrical ? 'bg-[#0F294A]' : 'bg-blue-700'
            )}
          >
            {isElectrical ? (
              <Zap className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Wrench className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F294A]">
              {isElectrical ? t.electricalCatalogTitle : t.plumbingCatalogTitle}
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              {isElectrical ? t.electricalCatalogSub : t.plumbingCatalogSub}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenCustomModal(trade)}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t.addCustomMaterialBtn.replace(/^\+\s*/, '')}</span>
          </button>

          {tradeEntries.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('list')}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#0F294A] transition-colors hover:bg-slate-50"
            >
              <ClipboardList className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
              <span className="tabular-nums">
                {t.viewMaterialList} ({tradeEntries.length})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Live Search Bar */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label={t.searchMaterialsPlaceholder}
          placeholder={t.searchMaterialsPlaceholder}
          className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white pl-11 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label={t.clearSearch}
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Selectable Category Cards */}
      <section aria-label={t.categoriesHeading} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">{t.categoriesHeading}</h2>
          {selectedCategoryId !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              {t.allCategories}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={cn(
              'flex min-h-[60px] flex-col justify-between rounded-xl border p-3 text-left transition-colors',
              selectedCategoryId === 'all'
                ? 'border-[#0F294A] bg-[#0F294A] text-white'
                : 'border-slate-200 bg-white text-[#0F294A] hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <span className="text-xs font-bold leading-snug">{t.allCategories}</span>
            <span
              className={cn(
                'mt-1 text-[11px] tabular-nums',
                selectedCategoryId === 'all' ? 'text-slate-200' : 'text-slate-500'
              )}
            >
              {categories.reduce((acc, c) => acc + c.items.length, 0)} {t.itemsCountSuffix}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  'flex min-h-[60px] flex-col justify-between rounded-xl border p-3 text-left transition-colors',
                  isSelected
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 bg-white text-[#0F294A] hover:border-blue-300 hover:bg-slate-50'
                )}
              >
                <span className="text-xs font-bold leading-snug">
                  {lang === 'ta' ? cat.nameTa : cat.nameEn}
                </span>
                <span
                  className={cn(
                    'mt-1 text-[11px] tabular-nums',
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  )}
                >
                  {cat.items.length} {t.itemsCountSuffix}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Materials Grid by Category */}
      <section aria-label={t.materialsHeading} className="space-y-6">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="max-w-md text-sm text-slate-600">{t.noSearchResults}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                }}
                className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {t.clearSearch}
              </button>
              <button
                type="button"
                onClick={() => onOpenCustomModal(trade)}
                className="min-h-[42px] rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                {t.addCustomMaterialBtn}
              </button>
            </div>
          </div>
        ) : (
          filteredGroups.map(({ category, matchingItems }) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-[#0F294A]">
                  {lang === 'ta' ? category.nameTa : category.nameEn}
                  <span className="mx-1.5 text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    {lang === 'ta' ? category.nameEn : category.nameTa}
                  </span>
                </h3>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {matchingItems.length} {t.itemsCountSuffix}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {matchingItems.map((item) => {
                  const addedCount = countInListForMaterial(item.nameEn, item.nameTa);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-semibold text-[#0F294A]">
                          {lang === 'ta' ? item.nameTa : item.nameEn}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {lang === 'ta' ? item.nameEn : item.nameTa}
                        </p>
                        {(item.defaultSize || item.defaultUnit) && (
                          <p className="text-xs text-slate-500">
                            {item.defaultSize ? `${item.defaultSize} · ` : ''}
                            {item.defaultUnit}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectCatalogItem(category, item)}
                        aria-label={`${t.selectMaterialBtn} ${lang === 'ta' ? item.nameTa : item.nameEn}`}
                        className={cn(
                          'inline-flex min-h-[44px] min-w-[82px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors',
                          addedCount > 0
                            ? 'border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-[#0F294A] text-white hover:bg-[#173B68]'
                        )}
                      >
                        {addedCount > 0 ? (
                          <>
                            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>+{addedCount}</span>
                          </>
                        ) : (
                          <span>{t.selectMaterialBtn}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
