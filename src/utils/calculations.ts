import { TRANSLATIONS } from '../i18n/translations';
import type {
  BuildingType,
  CatalogCategory,
  CatalogItem,
  Language,
  ListScope,
  MaterialEntry,
  SiteDetails,
  TradeType,
  UnitType,
  ValidationErrors,
} from '../types/material';

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createEmptySiteDetails(): SiteDetails {
  return {
    preparedBy: '',
    mobileNumber: '',
    siteName: '',
    customerName: '',
    customerMobile: '',
    siteAddress: '',
    buildingType: 'Residential House',
    totalSqFt: '',
    numberOfFloors: '1',
    date: getTodayIsoDate(),
  };
}

export function validateSiteDetails(details: SiteDetails, lang: Language): ValidationErrors {
  const t = TRANSLATIONS[lang];
  const errors: ValidationErrors = {};

  if (!details.preparedBy.trim()) {
    errors.preparedBy = t.errPreparedBy;
  }

  const digits = details.mobileNumber.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    errors.mobileNumber = t.errMobile;
  }

  if (details.customerMobile.trim()) {
    const custDigits = details.customerMobile.replace(/\D/g, '');
    if (custDigits.length < 10 || custDigits.length > 15) {
      errors.customerMobile = t.errMobile;
    }
  }

  return errors;
}

export function validateMaterialEntry(
  input: {
    materialName: string;
    categoryName: string;
    quantity: number;
    price?: number;
  },
  lang: Language
): ValidationErrors {
  const t = TRANSLATIONS[lang];
  const errors: ValidationErrors = {};

  if (!input.materialName.trim()) {
    errors.materialName = t.errMaterialName;
  }
  if (!input.categoryName.trim()) {
    errors.categoryName = t.errCategory;
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    errors.quantity = t.errQuantity;
  }
  if (input.price !== undefined && (!Number.isFinite(input.price) || input.price < 0)) {
    errors.price = t.errPrice;
  }

  return errors;
}

export interface FilteredCategoryResult {
  category: CatalogCategory;
  matchingItems: CatalogItem[];
}

export function filterCatalog(
  categories: CatalogCategory[],
  searchQuery: string,
  selectedCategoryId: string | 'all'
): FilteredCategoryResult[] {
  const q = searchQuery.trim().toLowerCase();

  return categories
    .filter((cat) => selectedCategoryId === 'all' || cat.id === selectedCategoryId)
    .map((cat) => {
      if (!q) {
        return { category: cat, matchingItems: cat.items };
      }
      const catMatches =
        cat.nameEn.toLowerCase().includes(q) || cat.nameTa.toLowerCase().includes(q);
      const matchingItems = catMatches
        ? cat.items
        : cat.items.filter(
            (item) =>
              item.nameEn.toLowerCase().includes(q) ||
              item.nameTa.toLowerCase().includes(q) ||
              (item.defaultSize && item.defaultSize.toLowerCase().includes(q)) ||
              (item.defaultSpec && item.defaultSpec.toLowerCase().includes(q))
          );
      return { category: cat, matchingItems };
    })
    .filter((group) => group.matchingItems.length > 0);
}

export function filterBrands(brands: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return brands;
  return brands.filter((b) => b.toLowerCase().includes(q));
}

export interface EstimateResult {
  quantity: number;
  unit: UnitType;
  explanationEn: string;
  explanationTa: string;
}

export function calculateEstimateQuantity(
  item: CatalogItem | null,
  totalSqFtInput: string | number,
  floorsInput: string | number,
  buildingType: BuildingType
): EstimateResult | null {
  const sqFt = typeof totalSqFtInput === 'number' ? totalSqFtInput : parseFloat(totalSqFtInput);
  if (!Number.isFinite(sqFt) || sqFt <= 0) {
    return null;
  }

  const floorsRaw = typeof floorsInput === 'number' ? floorsInput : parseFloat(floorsInput);
  const floors = Number.isFinite(floorsRaw) && floorsRaw >= 1 ? Math.min(floorsRaw, 20) : 1;

  const buildingMultiplier: Record<BuildingType, number> = {
    'Residential House': 1.0,
    'Apartment / Flat': 1.05,
    'Villa / Duplex': 1.15,
    'Commercial Shop / Office': 1.25,
    'Industrial / Shed': 0.9,
  };

  const mult = buildingMultiplier[buildingType] ?? 1.0;

  if (item?.estimateRule) {
    const raw = (sqFt / 1000) * item.estimateRule.qtyPer1000SqFt * mult + (floors - 1) * 0.15 * item.estimateRule.qtyPer1000SqFt;
    const qty = Math.max(item.estimateRule.minQty, Math.ceil(raw));
    return {
      quantity: qty,
      unit: item.estimateRule.unit,
      explanationEn: `${item.estimateRule.noteEn} (Estimated for ${sqFt} sq.ft, ${floors} floor(s), ${buildingType})`,
      explanationTa: `${item.estimateRule.noteTa} (${sqFt} சதுர அடி, ${floors} தளம்)`,
    };
  }

  // Generic thumb-rule estimate when no item-specific rule exists
  const base = Math.max(1, Math.ceil((sqFt / 500) * mult + (floors - 1)));
  return {
    quantity: base,
    unit: item?.defaultUnit ?? 'Nos',
    explanationEn: `Rough baseline estimate for ${sqFt} sq.ft (${floors} floor(s)). Adjust to site measurements.`,
    explanationTa: `${sqFt} சதுர அடி (${floors} தளம்) அடிப்படையிலான தோராய மதிப்பீடு. தளத்திற்கு ஏற்ப திருத்தவும்.`,
  };
}

export interface GroupedCategoryItems {
  categoryName: string;
  items: MaterialEntry[];
}

export interface TradeGroup {
  trade: TradeType;
  categories: GroupedCategoryItems[];
}

export function filterEntriesByScope(entries: MaterialEntry[], scope: ListScope): MaterialEntry[] {
  if (scope === 'combined') return entries;
  return entries.filter((e) => e.trade === scope);
}

export function groupMaterialsForExport(
  entries: MaterialEntry[],
  scope: ListScope
): TradeGroup[] {
  const filtered = filterEntriesByScope(entries, scope);
  const trades: TradeType[] =
    scope === 'combined' ? ['electrical', 'plumbing'] : [scope];

  const groups: TradeGroup[] = [];

  for (const trade of trades) {
    const tradeItems = filtered.filter((item) => item.trade === trade);
    if (tradeItems.length === 0) continue;

    const catMap = new Map<string, MaterialEntry[]>();
    for (const item of tradeItems) {
      const catKey = item.categoryName.trim() || 'Other';
      const existing = catMap.get(catKey);
      if (existing) {
        existing.push(item);
      } else {
        catMap.set(catKey, [item]);
      }
    }

    const categories: GroupedCategoryItems[] = [];
    for (const [categoryName, items] of catMap.entries()) {
      categories.push({ categoryName, items });
    }

    groups.push({ trade, categories });
  }

  return groups;
}

export interface ListTotals {
  totalItems: number;
  electricalCount: number;
  plumbingCount: number;
  totalQuantitySum: number;
  pricedItemsCount: number;
  estimatedPriceTotal: number;
}

export function computeListTotals(entries: MaterialEntry[]): ListTotals {
  let electricalCount = 0;
  let plumbingCount = 0;
  let totalQuantitySum = 0;
  let pricedItemsCount = 0;
  let estimatedPriceTotal = 0;

  for (const item of entries) {
    if (item.trade === 'electrical') electricalCount += 1;
    else plumbingCount += 1;

    totalQuantitySum += item.quantity;

    if (typeof item.price === 'number' && Number.isFinite(item.price) && item.price > 0) {
      pricedItemsCount += 1;
      estimatedPriceTotal += item.price * item.quantity;
    }
  }

  return {
    totalItems: entries.length,
    electricalCount,
    plumbingCount,
    totalQuantitySum,
    pricedItemsCount,
    estimatedPriceTotal,
  };
}

export function buildWhatsAppShareText(
  details: SiteDetails,
  entries: MaterialEntry[],
  scope: ListScope,
  lang: Language
): string {
  const scoped = filterEntriesByScope(entries, scope);
  const scopeLabel =
    scope === 'combined'
      ? lang === 'ta'
        ? 'மின்சாரம் & பிளம்பிங்'
        : 'Electrical & Plumbing'
      : scope === 'electrical'
        ? lang === 'ta'
          ? 'மின்சாரம்'
          : 'Electrical'
        : lang === 'ta'
          ? 'பிளம்பிங்'
          : 'Plumbing';

  const lines: string[] = [];
  lines.push(`*SITELIST PRO – ${scopeLabel} Material List*`);
  if (details.siteName.trim()) lines.push(`Site: ${details.siteName.trim()}`);
  if (details.preparedBy.trim()) lines.push(`Prepared By: ${details.preparedBy.trim()}`);
  if (details.mobileNumber.trim()) lines.push(`Mobile: ${details.mobileNumber.trim()}`);
  if (details.date.trim()) lines.push(`Date: ${details.date.trim()}`);
  lines.push(`Total Items: ${scoped.length}`);
  lines.push('');

  const previewLimit = 12;
  scoped.slice(0, previewLimit).forEach((item, idx) => {
    const brandPart = item.brand && item.brand !== 'No Brand' ? ` [${item.brand}]` : '';
    const sizePart = item.size ? ` (${item.size})` : '';
    lines.push(`${idx + 1}. ${item.materialName}${brandPart}${sizePart} - ${item.quantity} ${item.unit}`);
  });

  if (scoped.length > previewLimit) {
    lines.push(`...and ${scoped.length - previewLimit} more items in the attached PDF.`);
  }

  lines.push('');
  lines.push(
    lang === 'ta'
      ? 'குறிப்பு: பதிவிறக்கம் செய்யப்பட்ட PDF கோப்பை இத்துடன் இணைத்துள்ளேன்.'
      : 'Note: Please see the attached SiteList Pro A4 PDF for complete details.'
  );

  return lines.join('\n');
}

export function sanitizePdfFilename(details: SiteDetails, scope: ListScope): string {
  const base = (details.siteName || details.preparedBy || 'Material_List')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const safeBase = base || 'Material_List';
  const datePart = details.date || getTodayIsoDate();
  return `SiteListPro_${safeBase}_${scope}_${datePart}.pdf`;
}
