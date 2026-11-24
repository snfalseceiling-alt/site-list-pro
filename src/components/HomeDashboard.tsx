import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  FileDown,
  PlusCircle,
  UserCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import type { AppScreen, SiteDetails, TradeType } from '../types/material';
import type { Translations } from '../i18n/translations';
import { computeListTotals } from '../utils/calculations';
import type { MaterialEntry } from '../types/material';

interface HomeDashboardProps {
  details: SiteDetails;
  entries: MaterialEntry[];
  onStartTrade: (trade: TradeType) => void;
  onNavigate: (screen: AppScreen) => void;
  onStartNewList: () => void;
  t: Translations;
}

export function HomeDashboard({
  details,
  entries,
  onStartTrade,
  onNavigate,
  onStartNewList,
  t,
}: HomeDashboardProps) {
  const totals = computeListTotals(entries);
  const hasDetails = Boolean(details.preparedBy.trim() && details.mobileNumber.trim());

  return (
    <div className="space-y-8">
      {/* Temporary Memory Session Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-3 text-sm text-slate-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
        <div>
          <span className="font-semibold text-[#0F294A]">{t.tempNoticeTitle}: </span>
          <span>{t.tempNoticeDesc}</span>
        </div>
      </div>

      {/* Main Hero Heading & Active Session Strip */}
      <section className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold tracking-wide text-blue-700">
            {t.tagline}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F294A] [text-wrap:balance] sm:text-4xl">
            {t.homeHeading}
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            {t.homeDescription}
          </p>
        </div>

        {/* Active Session Metrics */}
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-500">{t.totalItemsMetric}</p>
            <p className="mt-0.5 text-2xl font-bold text-[#0F294A] tabular-nums">
              {totals.totalItems}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-slate-500">{t.electricalItemsLabel}</p>
            <p className="mt-0.5 text-2xl font-bold text-blue-700 tabular-nums">
              {totals.electricalCount}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-slate-500">{t.plumbingItemsLabel}</p>
            <p className="mt-0.5 text-2xl font-bold text-emerald-700 tabular-nums">
              {totals.plumbingCount}
            </p>
          </div>
        </div>
      </section>

      {/* Active Site Details Status Bar */}
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0F294A]">
            <UserCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            {hasDetails ? (
              <>
                <p className="text-sm font-semibold text-[#0F294A]">
                  {details.preparedBy} <span className="text-slate-400">·</span>{' '}
                  <span className="tabular-nums">{details.mobileNumber}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {details.siteName ? `${details.siteName} · ` : ''}
                  {details.buildingType}
                  {details.totalSqFt ? ` · ${details.totalSqFt} sq.ft` : ''}
                  {details.date ? ` · ${details.date}` : ''}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#0F294A]">{t.detailsTitle}</p>
                <p className="mt-0.5 text-xs text-slate-600">{t.requiredFieldsNote}</p>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('details')}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#0F294A] transition-colors hover:bg-slate-50"
        >
          <span>{hasDetails ? t.editSiteDetails : t.siteDetailsAction}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>

      {/* Two Large Trade Selection Cards */}
      <section aria-label="Material Categories" className="grid gap-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onStartTrade('electrical')}
          className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-blue-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-8"
        >
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0F294A] text-white transition-colors group-hover:bg-blue-700">
              <Zap className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {totals.electricalCount > 0
                ? `${totals.electricalCount} ${t.itemsCountSuffix}`
                : '8 categories'}
            </span>
          </div>

          <div className="mt-6 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[#0F294A] sm:text-2xl">
                {t.electricalCardTitle}
              </h2>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {t.electricalCardDesc}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onStartTrade('plumbing')}
          className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-blue-600 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-8"
        >
          <div className="flex w-full items-start justify-between gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition-colors group-hover:bg-[#0F294A]">
              <Wrench className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {totals.plumbingCount > 0
                ? `${totals.plumbingCount} ${t.itemsCountSuffix}`
                : '9 categories'}
            </span>
          </div>

          <div className="mt-6 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[#0F294A] sm:text-2xl">
                {t.plumbingCardTitle}
              </h2>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {t.plumbingCardDesc}
            </p>
          </div>
        </button>
      </section>

      {/* Bottom 3 Action Controls: Create New List, Current List Summary, Generate PDF */}
      <section aria-label={t.startWorkflowTitle} className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">{t.startWorkflowTitle}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onStartNewList}
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0F294A] transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <PlusCircle className="h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
            <span className="whitespace-nowrap">{t.createNewListAction}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('list')}
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0F294A] transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <ClipboardList className="h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
            <span className="whitespace-nowrap">
              {t.currentSummaryAction} ({totals.totalItems})
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('pdf')}
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[#0F294A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#173B68]"
          >
            <FileDown className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{t.generatePdfAction}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
