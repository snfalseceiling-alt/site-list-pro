import { useState } from 'react';
import { Ban, Check, Pencil, Plus, Search } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import { filterBrands } from '../utils/calculations';
import { cn } from '../utils/cn';

interface BrandSelectorProps {
  value: string;
  onChange: (brand: string) => void;
  brands: string[];
  onAddBrand: (newBrand: string) => void;
  onRenameBrand: (oldBrand: string, newBrand: string) => void;
  t: Translations;
}

export function BrandSelector({
  value,
  onChange,
  brands,
  onAddBrand,
  onRenameBrand,
  t,
}: BrandSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const filtered = filterBrands(brands, searchQuery);
  const isNoBrand = value === 'No Brand' || value === '';

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onAddBrand(trimmed);
    onChange(trimmed);
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleStartEdit = (brandToEdit: string) => {
    setEditingBrand(brandToEdit);
    setEditDraft(brandToEdit);
  };

  const handleSaveEdit = () => {
    const trimmed = editDraft.trim();
    if (!trimmed || !editingBrand) return;
    onRenameBrand(editingBrand, trimmed);
    if (value === editingBrand) {
      onChange(trimmed);
    }
    setEditingBrand(null);
    setEditDraft('');
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="brand-search-input" className="text-sm font-semibold text-[#0F294A]">
          {t.brandFieldLabel}
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange('No Brand')}
            className={cn(
              'inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
              value === 'No Brand'
                ? 'border-[#0F294A] bg-[#0F294A] text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            )}
          >
            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.noBrandOption}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCustomInput((prev) => !prev)}
            className="inline-flex min-h-[34px] items-center gap-1 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.addCustomBrandBtn}</span>
          </button>
        </div>
      </div>

      {/* Selected Brand Indicator & Manual Edit */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <div className="text-xs text-slate-600">
          <span>{t.selectedBrandLabel}: </span>
          <strong className="text-sm text-[#0F294A]">
            {isNoBrand ? t.noBrandOption : value}
          </strong>
        </div>
        {!isNoBrand && editingBrand !== value && (
          <button
            type="button"
            onClick={() => handleStartEdit(value)}
            className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            <span>{t.editBrandBtn}</span>
          </button>
        )}
      </div>

      {/* Inline Brand Rename Editor */}
      {editingBrand && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            aria-label={t.editBrandBtn}
            className="min-h-[40px] flex-1 rounded-lg border border-blue-400 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-2 focus:outline-blue-600"
          />
          <button
            type="button"
            onClick={handleSaveEdit}
            className="min-h-[40px] whitespace-nowrap rounded-lg bg-[#0F294A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#173B68]"
          >
            {t.saveBrandEditBtn}
          </button>
          <button
            type="button"
            onClick={() => setEditingBrand(null)}
            className="min-h-[40px] whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {t.cancelBtn}
          </button>
        </div>
      )}

      {/* Add Custom Brand Row */}
      {showCustomInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={t.customBrandPlaceholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="min-h-[40px] whitespace-nowrap rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            {t.saveBrandEditBtn}
          </button>
        </div>
      )}

      {/* Search or Type Brand Input */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id="brand-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim()) {
              onChange(e.target.value);
            }
          }}
          placeholder={t.brandSearchPlaceholder}
          className="min-h-[42px] w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
        />
      </div>

      {/* Interactive Brand Suggestion Buttons */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-slate-500">{t.suggestedBrandsLabel}</p>
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((brand) => {
            const selected = value === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  onChange(brand);
                  setSearchQuery('');
                }}
                className={cn(
                  'inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                  selected
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                )}
              >
                {selected && <Check className="h-3 w-3 shrink-0" aria-hidden="true" />}
                <span>{brand}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">{t.brandHelperNote}</p>
    </div>
  );
}
