import { useState } from 'react';
import {
  FileDown,
  Minus,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { AppScreen, ListScope, MaterialEntry, TradeType } from '../types/material';
import { computeListTotals, filterEntriesByScope } from '../utils/calculations';
import { cn } from '../utils/cn';

interface MaterialListSummaryProps {
  entries: MaterialEntry[];
  t: Translations;
  onEditEntry: (entry: MaterialEntry) => void;
  onUpdateQuantity: (id: string, nextQty: number) => void;
  onDeleteEntry: (id: string) => void;
  onClearList: () => void;
  onOpenCustomModal: (trade: TradeType) => void;
  onNavigate: (screen: AppScreen) => void;
}

export function MaterialListSummary({
  entries,
  t,
  onEditEntry,
  onUpdateQuantity,
  onDeleteEntry,
  onClearList,
  onOpenCustomModal,
  onNavigate,
}: MaterialListSummaryProps) {
  const [activeTab, setActiveTab] = useState<ListScope>('combined');
  const [confirmClear, setConfirmClear] = useState(false);

  const totals = computeListTotals(entries);
  const visibleEntries = filterEntriesByScope(entries, activeTab);
  const visibleTotals = computeListTotals(visibleEntries);

  const tabs: { id: ListScope; label: string; count: number }[] = [
    { id: 'combined', label: t.tabCombined, count: totals.totalItems },
    { id: 'electrical', label: t.tabElectrical, count: totals.electricalCount },
    { id: 'plumbing', label: t.tabPlumbing, count: totals.plumbingCount },
  ];

  const customTradeTarget: TradeType =
    activeTab === 'plumbing' ? 'plumbing' : 'electrical';

  return (
    <div className="space-y-6">
      {/* Page Title & Primary Toolbar */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F294A]">{t.summaryTitle}</h1>
          <p className="mt-0.5 text-sm text-slate-600">{t.summarySubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('electrical')}
            className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#0F294A] hover:bg-slate-50 sm:text-sm"
          >
            <Zap className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
            <span>{t.navElectrical}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('plumbing')}
            className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#0F294A] hover:bg-slate-50 sm:text-sm"
          >
            <Wrench className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
            <span>{t.navPlumbing}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCustomModal(customTradeTarget)}
            className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 sm:text-sm"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t.addCustomMaterialBtn.replace(/^\+\s*/, '')}</span>
          </button>

          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('pdf')}
              className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#0F294A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#173B68] sm:text-sm"
            >
              <FileDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t.generatePdfAction}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs + Clear List Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Material List Scope"
          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'min-h-[38px] whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
                  selected
                    ? 'bg-white text-[#0F294A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {entries.length > 0 && !confirmClear && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="inline-flex min-h-[38px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.clearListBtn}</span>
          </button>
        )}
      </div>

      {confirmClear && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <span className="font-medium text-red-900">{t.confirmClearPrompt}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmClear(false);
                onClearList();
              }}
              className="min-h-[36px] rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              {t.confirmYesClear}
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {t.cancelBtn}
            </button>
          </div>
        </div>
      )}

      {/* Summary Totals Strip */}
      {visibleEntries.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{t.totalItemsMetric}</p>
            <p className="mt-1 text-2xl font-bold text-[#0F294A] tabular-nums">
              {visibleTotals.totalItems}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{t.electricalItemsLabel}</p>
            <p className="mt-1 text-2xl font-bold text-blue-700 tabular-nums">
              {visibleTotals.electricalCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{t.plumbingItemsLabel}</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
              {visibleTotals.plumbingCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{t.estimatedAmountMetric}</p>
            <p className="mt-1 text-2xl font-bold text-[#0F294A] tabular-nums">
              {visibleTotals.estimatedPriceTotal > 0
                ? `₹${visibleTotals.estimatedPriceTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Empty State or Table / Mobile Cards */}
      {visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-[#0F294A]">{t.emptyListTitle}</h2>
          <p className="max-w-md text-sm text-slate-600">{t.emptyListDesc}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('electrical')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0F294A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173B68]"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              <span>{t.browseElectricalBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('plumbing')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Wrench className="h-4 w-4" aria-hidden="true" />
              <span>{t.browsePlumbingBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3 text-center">{t.colSNo}</th>
                  <th className="px-4 py-3">{t.colMaterial}</th>
                  <th className="px-4 py-3">{t.colBrand}</th>
                  <th className="px-4 py-3">{t.colSize}</th>
                  <th className="px-4 py-3">{t.colSpec}</th>
                  <th className="px-4 py-3 text-center">{t.colQty}</th>
                  <th className="px-4 py-3">{t.colUnit}</th>
                  <th className="px-4 py-3 text-right">{t.colPrice}</th>
                  <th className="px-4 py-3 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleEntries.map((item, idx) => {
                  const rowTotal =
                    typeof item.price === 'number' && item.price > 0
                      ? item.price * item.quantity
                      : null;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-center font-medium text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0F294A]">{item.materialName}</p>
                        <p className="text-xs text-slate-500">
                          {item.trade === 'electrical' ? t.navElectrical : t.navPlumbing} ·{' '}
                          {item.categoryName}
                        </p>
                        {item.notes && (
                          <p className="mt-0.5 text-xs text-slate-500">{item.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.brand && item.brand !== 'No Brand' ? (
                          <span className="font-medium text-slate-900">{item.brand}</span>
                        ) : (
                          <span className="text-slate-400">{t.noBrandOption}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.size || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {item.specification || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(item.id, Math.max(0.5, item.quantity - 1))
                            }
                            aria-label={`Decrease quantity of ${item.materialName}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="min-w-[36px] text-center font-bold text-[#0F294A] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.materialName}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.unit}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800 tabular-nums">
                        {rowTotal !== null ? `₹${rowTotal.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditEntry(item)}
                            aria-label={`${t.editAction} ${item.materialName}`}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t.editAction}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(item.id)}
                            aria-label={`${t.deleteAction} ${item.materialName}`}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 px-2.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t.deleteAction}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-3 md:hidden">
            {visibleEntries.map((item, idx) => {
              const rowTotal =
                typeof item.price === 'number' && item.price > 0
                  ? item.price * item.quantity
                  : null;
              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        #{idx + 1} · {item.categoryName}
                      </p>
                      <h3 className="text-base font-bold text-[#0F294A]">{item.materialName}</h3>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {item.brand && item.brand !== 'No Brand' ? item.brand : t.noBrandOption}
                        {item.size ? ` · ${item.size}` : ''}
                      </p>
                      {item.specification && (
                        <p className="text-xs text-slate-500">{item.specification}</p>
                      )}
                      {item.notes && (
                        <p className="mt-1 text-xs text-slate-500">{item.notes}</p>
                      )}
                    </div>

                    {rowTotal !== null && (
                      <span className="text-sm font-bold text-[#0F294A] tabular-nums">
                        ₹{rowTotal.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.id, Math.max(0.5, item.quantity - 1))
                        }
                        aria-label={`Decrease quantity of ${item.materialName}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="min-w-[52px] text-center text-sm font-bold text-[#0F294A] tabular-nums">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.materialName}`}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditEntry(item)}
                        aria-label={`${t.editAction} ${item.materialName}`}
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.editAction}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(item.id)}
                        aria-label={`${t.deleteAction} ${item.materialName}`}
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.deleteAction}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
