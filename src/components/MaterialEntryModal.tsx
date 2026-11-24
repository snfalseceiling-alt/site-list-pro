import { useEffect, useState, type FormEvent } from 'react';
import { Calculator, Info, Plus, X } from 'lucide-react';
import { UNITS } from '../data/catalog';
import type { Translations } from '../i18n/translations';
import type {
  CatalogCategory,
  CatalogItem,
  CustomCategory,
  Language,
  MaterialEntry,
  SiteDetails,
  TradeType,
  UnitType,
  ValidationErrors,
} from '../types/material';
import { calculateEstimateQuantity, validateMaterialEntry } from '../utils/calculations';
import { cn } from '../utils/cn';
import { BrandSelector } from './BrandSelector';

export interface MaterialModalTarget {
  mode: 'add' | 'edit' | 'custom';
  trade: TradeType;
  category?: CatalogCategory;
  catalogItem?: CatalogItem;
  existingEntry?: MaterialEntry;
}

interface MaterialEntryModalProps {
  target: MaterialModalTarget;
  categories: CatalogCategory[];
  customCategories: CustomCategory[];
  brands: string[];
  siteDetails: SiteDetails;
  lang: Language;
  t: Translations;
  onAddCustomCategory: (trade: TradeType, name: string) => CustomCategory;
  onAddBrand: (trade: TradeType, brand: string) => void;
  onRenameBrand: (trade: TradeType, oldBrand: string, newBrand: string) => void;
  onSubmit: (entry: Omit<MaterialEntry, 'id'>, existingId?: string) => void;
  onClose: () => void;
}

export function MaterialEntryModal({
  target,
  categories,
  customCategories,
  brands,
  siteDetails,
  lang,
  t,
  onAddCustomCategory,
  onAddBrand,
  onRenameBrand,
  onSubmit,
  onClose,
}: MaterialEntryModalProps) {
  const trade = target.trade;
  const isEdit = target.mode === 'edit' && target.existingEntry;
  const isCustomMode = target.mode === 'custom' || Boolean(target.existingEntry?.isCustom);

  const availableCategories = [
    ...categories.map((c) => ({
      id: c.id,
      name: lang === 'ta' ? c.nameTa : c.nameEn,
    })),
    ...customCategories
      .filter((cc) => cc.trade === trade)
      .map((cc) => ({ id: cc.id, name: cc.name })),
  ];

  const initialCategoryId = isEdit
    ? target.existingEntry!.categoryId
    : target.category?.id ?? availableCategories[0]?.id ?? 'custom-new';

  const initialCategoryName = isEdit
    ? target.existingEntry!.categoryName
    : target.category
      ? lang === 'ta'
        ? target.category.nameTa
        : target.category.nameEn
      : availableCategories[0]?.name ?? '';

  const [materialName, setMaterialName] = useState(
    isEdit
      ? target.existingEntry!.materialName
      : target.catalogItem
        ? lang === 'ta'
          ? target.catalogItem.nameTa
          : target.catalogItem.nameEn
        : ''
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [categoryName, setCategoryName] = useState(initialCategoryName);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [brand, setBrand] = useState(
    isEdit ? target.existingEntry!.brand : 'No Brand'
  );
  const [size, setSize] = useState(
    isEdit
      ? target.existingEntry!.size
      : target.catalogItem?.defaultSize ?? ''
  );
  const [specification, setSpecification] = useState(
    isEdit
      ? target.existingEntry!.specification
      : target.catalogItem?.defaultSpec ?? ''
  );
  const [quantity, setQuantity] = useState<string>(
    isEdit ? String(target.existingEntry!.quantity) : '1'
  );
  const [unit, setUnit] = useState<UnitType>(
    isEdit
      ? target.existingEntry!.unit
      : target.catalogItem?.defaultUnit ?? 'Nos'
  );
  const [price, setPrice] = useState<string>(
    isEdit && target.existingEntry!.price !== undefined
      ? String(target.existingEntry!.price)
      : ''
  );
  const [notes, setNotes] = useState(
    isEdit ? target.existingEntry!.notes ?? '' : ''
  );

  const [qtyMode, setQtyMode] = useState<'manual' | 'estimate'>('manual');
  const [inlineSqFt, setInlineSqFt] = useState(siteDetails.totalSqFt || '1000');
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const estimateResult = calculateEstimateQuantity(
    target.catalogItem ?? null,
    inlineSqFt,
    siteDetails.numberOfFloors || '1',
    siteDetails.buildingType
  );

  const handleCategoryChange = (val: string) => {
    if (val === '__new_custom__') {
      setCreatingCategory(true);
      setSelectedCategoryId('__new_custom__');
      setCategoryName('');
      return;
    }
    setCreatingCategory(false);
    setSelectedCategoryId(val);
    const found = availableCategories.find((c) => c.id === val);
    setCategoryName(found ? found.name : val);
  };

  const handleCreateCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const created = onAddCustomCategory(trade, trimmed);
    setSelectedCategoryId(created.id);
    setCategoryName(created.name);
    setCreatingCategory(false);
    setNewCategoryInput('');
  };

  const handleApplyEstimate = () => {
    if (!estimateResult) return;
    setQuantity(String(estimateResult.quantity));
    setUnit(estimateResult.unit);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const resolvedCategoryName = creatingCategory
      ? newCategoryInput.trim()
      : categoryName.trim();

    let finalCategoryId = selectedCategoryId;
    let finalCategoryName = resolvedCategoryName;

    if (creatingCategory && resolvedCategoryName) {
      const created = onAddCustomCategory(trade, resolvedCategoryName);
      finalCategoryId = created.id;
      finalCategoryName = created.name;
    }

    const parsedQty = parseFloat(quantity);
    const parsedPrice = price.trim() ? parseFloat(price) : undefined;

    const validation = validateMaterialEntry(
      {
        materialName,
        categoryName: finalCategoryName,
        quantity: parsedQty,
        price: parsedPrice,
      },
      lang
    );

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    onSubmit(
      {
        trade,
        categoryId: finalCategoryId,
        categoryName: finalCategoryName,
        materialName: materialName.trim(),
        brand: brand.trim() || 'No Brand',
        size: size.trim(),
        specification: specification.trim(),
        quantity: parsedQty,
        unit,
        price: parsedPrice,
        notes: notes.trim() || undefined,
        isCustom: isCustomMode,
      },
      isEdit ? target.existingEntry!.id : undefined
    );
  };

  const heading = isEdit
    ? t.editMaterialTitle
    : isCustomMode
      ? t.customMaterialTitle
      : t.addMaterialTitle;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="material-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 id="material-modal-title" className="text-lg font-bold text-[#0F294A]">
            {heading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {/* 1. Material Name & 2. Category */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="entry-material-name" className="block text-sm font-semibold text-[#0F294A]">
                  {t.materialNameLabel} <span className="text-red-600">*</span>
                </label>
                <input
                  id="entry-material-name"
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder={t.materialNamePlaceholder}
                  className={cn(
                    'min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-blue-600',
                    errors.materialName ? 'border-red-500' : 'border-slate-300'
                  )}
                />
                {errors.materialName && (
                  <p className="text-xs font-medium text-red-600">{errors.materialName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="entry-category" className="block text-sm font-semibold text-[#0F294A]">
                  {t.categoryLabel} <span className="text-red-600">*</span>
                </label>
                <select
                  id="entry-category"
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={cn(
                    'min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-blue-600',
                    errors.categoryName ? 'border-red-500' : 'border-slate-300'
                  )}
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__new_custom__">{t.customCategoryOption}</option>
                </select>
                {errors.categoryName && (
                  <p className="text-xs font-medium text-red-600">{errors.categoryName}</p>
                )}
              </div>
            </div>

            {creatingCategory && (
              <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder={t.customCategoryPlaceholder}
                  className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-2 focus:outline-blue-600"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="inline-flex min-h-[40px] items-center gap-1 whitespace-nowrap rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.saveBrandEditBtn}</span>
                </button>
              </div>
            )}

            {/* 3. Brand Selector */}
            <BrandSelector
              value={brand}
              onChange={setBrand}
              brands={brands}
              onAddBrand={(b) => onAddBrand(trade, b)}
              onRenameBrand={(oldB, newB) => onRenameBrand(trade, oldB, newB)}
              t={t}
            />

            {/* 4. Size & 5. Specification */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="entry-size" className="block text-sm font-semibold text-[#0F294A]">
                  {t.sizeLabel}
                </label>
                <input
                  id="entry-size"
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder={t.sizePlaceholder}
                  className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="entry-spec" className="block text-sm font-semibold text-[#0F294A]">
                  {t.specificationLabel}
                </label>
                <input
                  id="entry-spec"
                  type="text"
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder={t.specificationPlaceholder}
                  className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
                />
              </div>
            </div>

            {/* 6. Quantity Management (Manual vs Optional Automatic Estimate) & 7. Unit */}
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#0F294A]">
                  {t.quantityLabel} <span className="text-red-600">*</span>
                </span>

                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setQtyMode('manual')}
                    className={cn(
                      'min-h-[32px] whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      qtyMode === 'manual'
                        ? 'bg-[#0F294A] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {t.quantityModeManual}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQtyMode('estimate')}
                    className={cn(
                      'inline-flex min-h-[32px] items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      qtyMode === 'estimate'
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.quantityModeEstimate}</span>
                  </button>
                </div>
              </div>

              {qtyMode === 'estimate' && (
                <div className="space-y-2.5 rounded-lg border border-blue-200 bg-white p-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[140px] flex-1 space-y-1">
                      <label htmlFor="est-sqft" className="block text-xs font-medium text-slate-600">
                        {t.totalSqFt}
                      </label>
                      <input
                        id="est-sqft"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={inlineSqFt}
                        onChange={(e) => setInlineSqFt(e.target.value)}
                        className="min-h-[38px] w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm tabular-nums focus:outline-2 focus:outline-blue-600"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!estimateResult}
                      onClick={handleApplyEstimate}
                      className="min-h-[38px] whitespace-nowrap rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                      {t.applyEstimateBtn}{' '}
                      {estimateResult ? `(${estimateResult.quantity} ${estimateResult.unit})` : ''}
                    </button>
                  </div>

                  {estimateResult ? (
                    <p className="text-xs text-slate-600">
                      {lang === 'ta' ? estimateResult.explanationTa : estimateResult.explanationEn}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-700">{t.estimateNeedSqFt}</p>
                  )}

                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-700" aria-hidden="true" />
                    <span>{t.estimateDisclaimer}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label htmlFor="entry-qty" className="block text-xs font-medium text-slate-600">
                    {t.quantityLabel}
                  </label>
                  <input
                    id="entry-qty"
                    type="number"
                    step="any"
                    min="0.01"
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={cn(
                      'min-h-[44px] w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-[#0F294A] tabular-nums focus:outline-2 focus:outline-blue-600',
                      errors.quantity ? 'border-red-500' : 'border-slate-300'
                    )}
                  />
                  {errors.quantity && (
                    <p className="text-xs font-medium text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="entry-unit" className="block text-xs font-medium text-slate-600">
                    {t.unitLabel}
                  </label>
                  <select
                    id="entry-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-blue-600"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Price (Optional) */}
                <div className="col-span-2 space-y-1 sm:col-span-1">
                  <label htmlFor="entry-price" className="block text-xs font-medium text-slate-600">
                    {t.priceLabel}
                  </label>
                  <input
                    id="entry-price"
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₹ 0"
                    className={cn(
                      'min-h-[44px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600',
                      errors.price ? 'border-red-500' : 'border-slate-300'
                    )}
                  />
                  {errors.price && (
                    <p className="text-xs font-medium text-red-600">{errors.price}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 9. Notes (Optional) */}
            <div className="space-y-1.5">
              <label htmlFor="entry-notes" className="block text-sm font-semibold text-[#0F294A]">
                {t.notesLabel}
              </label>
              <textarea
                id="entry-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
              />
            </div>
          </div>

          {/* Sticky Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] whitespace-nowrap rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="min-h-[44px] whitespace-nowrap rounded-xl bg-[#0F294A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#173B68]"
            >
              {isEdit ? t.saveChangesBtn : t.addToListBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
