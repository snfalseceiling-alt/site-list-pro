import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Wrench, Zap } from 'lucide-react';
import { BUILDING_TYPES } from '../data/catalog';
import type { Translations } from '../i18n/translations';
import type { BuildingType, Language, SiteDetails, TradeType, ValidationErrors } from '../types/material';
import { validateSiteDetails } from '../utils/calculations';
import { cn } from '../utils/cn';

interface SiteDetailsFormProps {
  details: SiteDetails;
  pendingTrade: TradeType | null;
  lang: Language;
  t: Translations;
  onSave: (updated: SiteDetails, nextTrade?: TradeType) => void;
}

export function SiteDetailsForm({
  details,
  pendingTrade,
  lang,
  t,
  onSave,
}: SiteDetailsFormProps) {
  const [form, setForm] = useState<SiteDetails>(details);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [savedNotice, setSavedNotice] = useState(false);

  const handleChange = <K extends keyof SiteDetails>(key: K, value: SiteDetails[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedNotice(false);
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const submitWithTarget = (targetTrade?: TradeType) => {
    const validation = validateSiteDetails(form, lang);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    setSavedNotice(!targetTrade);
    onSave(form, targetTrade);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitWithTarget(pendingTrade ?? undefined);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-[#0F294A] sm:text-3xl">{t.detailsTitle}</h1>
        <p className="text-sm text-slate-600">{t.detailsSubtitle}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"
      >
        <p className="text-xs font-medium text-slate-500">{t.requiredFieldsNote}</p>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Prepared By */}
          <div className="space-y-1.5">
            <label htmlFor="preparedBy" className="block text-sm font-semibold text-[#0F294A]">
              {t.preparedBy} <span className="text-red-600">*</span>
            </label>
            <input
              id="preparedBy"
              type="text"
              value={form.preparedBy}
              onChange={(e) => handleChange('preparedBy', e.target.value)}
              placeholder={t.preparedByPlaceholder}
              className={cn(
                'min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600',
                errors.preparedBy ? 'border-red-500' : 'border-slate-300'
              )}
            />
            {errors.preparedBy && (
              <p className="text-xs font-medium text-red-600">{errors.preparedBy}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label htmlFor="mobileNumber" className="block text-sm font-semibold text-[#0F294A]">
              {t.mobileNumber} <span className="text-red-600">*</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              inputMode="numeric"
              value={form.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              placeholder={t.mobilePlaceholder}
              className={cn(
                'min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600',
                errors.mobileNumber ? 'border-red-500' : 'border-slate-300'
              )}
            />
            {errors.mobileNumber && (
              <p className="text-xs font-medium text-red-600">{errors.mobileNumber}</p>
            )}
          </div>

          {/* Site Name */}
          <div className="space-y-1.5">
            <label htmlFor="siteName" className="block text-sm font-semibold text-[#0F294A]">
              {t.siteName}
            </label>
            <input
              id="siteName"
              type="text"
              value={form.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder={t.siteNamePlaceholder}
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
            />
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <label htmlFor="customerName" className="block text-sm font-semibold text-[#0F294A]">
              {t.customerName}
            </label>
            <input
              id="customerName"
              type="text"
              value={form.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              placeholder={t.customerNamePlaceholder}
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
            />
          </div>

          {/* Customer Mobile Number */}
          <div className="space-y-1.5">
            <label htmlFor="customerMobile" className="block text-sm font-semibold text-[#0F294A]">
              {t.customerMobile}
            </label>
            <input
              id="customerMobile"
              type="tel"
              inputMode="numeric"
              value={form.customerMobile}
              onChange={(e) => handleChange('customerMobile', e.target.value)}
              placeholder={t.customerMobilePlaceholder}
              className={cn(
                'min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600',
                errors.customerMobile ? 'border-red-500' : 'border-slate-300'
              )}
            />
            {errors.customerMobile && (
              <p className="text-xs font-medium text-red-600">{errors.customerMobile}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label htmlFor="siteDate" className="block text-sm font-semibold text-[#0F294A]">
              {t.dateLabel}
            </label>
            <input
              id="siteDate"
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 tabular-nums focus:outline-2 focus:outline-blue-600"
            />
          </div>

          {/* Site Address */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="siteAddress" className="block text-sm font-semibold text-[#0F294A]">
              {t.siteAddress}
            </label>
            <input
              id="siteAddress"
              type="text"
              value={form.siteAddress}
              onChange={(e) => handleChange('siteAddress', e.target.value)}
              placeholder={t.siteAddressPlaceholder}
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
            />
          </div>

          {/* Building Type */}
          <div className="space-y-1.5">
            <label htmlFor="buildingType" className="block text-sm font-semibold text-[#0F294A]">
              {t.buildingType}
            </label>
            <select
              id="buildingType"
              value={form.buildingType}
              onChange={(e) => handleChange('buildingType', e.target.value as BuildingType)}
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-2 focus:outline-blue-600"
            >
              {BUILDING_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {lang === 'ta' ? bt.labelTa : bt.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Total Square Feet */}
            <div className="space-y-1.5">
              <label htmlFor="totalSqFt" className="block text-sm font-semibold text-[#0F294A]">
                {t.totalSqFt}
              </label>
              <input
                id="totalSqFt"
                type="number"
                min="0"
                inputMode="numeric"
                value={form.totalSqFt}
                onChange={(e) => handleChange('totalSqFt', e.target.value)}
                placeholder={t.sqFtPlaceholder}
                className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
              />
            </div>

            {/* Number of Floors */}
            <div className="space-y-1.5">
              <label htmlFor="numberOfFloors" className="block text-sm font-semibold text-[#0F294A]">
                {t.numberOfFloors}
              </label>
              <input
                id="numberOfFloors"
                type="number"
                min="1"
                inputMode="numeric"
                value={form.numberOfFloors}
                onChange={(e) => handleChange('numberOfFloors', e.target.value)}
                placeholder={t.floorsPlaceholder}
                className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
              />
            </div>
          </div>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t.detailsSavedMsg}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => submitWithTarget('electrical')}
            className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F294A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173B68]"
          >
            <Zap className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{t.saveAndElectrical}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => submitWithTarget('plumbing')}
            className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            <Wrench className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{t.saveAndPlumbing}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="submit"
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span className="whitespace-nowrap">{t.saveDetailsOnly}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
