import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ELECTRICAL_CATALOG, PLUMBING_CATALOG } from '../data/catalog';
import {
  buildWhatsAppShareText,
  calculateEstimateQuantity,
  computeListTotals,
  createEmptySiteDetails,
  filterBrands,
  filterCatalog,
  groupMaterialsForExport,
  sanitizePdfFilename,
  validateMaterialEntry,
  validateSiteDetails,
} from './calculations';
import { generateMaterialListPdfBytes, splitScriptRuns } from './pdfGenerator';
import type { MaterialEntry } from '../types/material';

test('validateSiteDetails enforces required preparedBy and valid mobileNumber', () => {
  const empty = createEmptySiteDetails();
  const errs = validateSiteDetails(empty, 'en');
  assert.ok(errs.preparedBy);
  assert.ok(errs.mobileNumber);

  const valid = {
    ...empty,
    preparedBy: 'Karthik S',
    mobileNumber: '9876543210',
  };
  assert.deepEqual(validateSiteDetails(valid, 'en'), {});
});

test('validateMaterialEntry validates name, category, positive quantity, and non-negative price', () => {
  const bad = validateMaterialEntry(
    { materialName: '', categoryName: '', quantity: 0, price: -5 },
    'en'
  );
  assert.ok(bad.materialName);
  assert.ok(bad.categoryName);
  assert.ok(bad.quantity);
  assert.ok(bad.price);

  const good = validateMaterialEntry(
    { materialName: '2.5 sq.mm Wire', categoryName: 'Electrical Wires', quantity: 4, price: 1850 },
    'en'
  );
  assert.deepEqual(good, {});
});

test('filterCatalog searches across English and Tamil material names', () => {
  const enResults = filterCatalog(ELECTRICAL_CATALOG, '2.5 sq.mm', 'all');
  assert.equal(enResults.length, 1);
  assert.equal(enResults[0].matchingItems[0].id, 'ew-25');

  const taResults = filterCatalog(PLUMBING_CATALOG, 'சிபிவிசி', 'all');
  assert.ok(taResults.length >= 1);
});

test('filterBrands matches case-insensitively', () => {
  const res = filterBrands(['Polycab', 'Finolex', 'Havells'], 'poly');
  assert.deepEqual(res, ['Polycab']);
});

test('calculateEstimateQuantity scales with square feet and floors', () => {
  const wireItem = ELECTRICAL_CATALOG[0].items[3]; // 2.5 sq.mm Wire
  const est = calculateEstimateQuantity(wireItem, '2000', '2', 'Residential House');
  assert.ok(est !== null);
  assert.ok(est.quantity >= 8);
  assert.equal(est.unit, 'Roll');

  assert.equal(calculateEstimateQuantity(wireItem, '', '1', 'Residential House'), null);
});

test('groupMaterialsForExport and computeListTotals separate and summarize correctly', () => {
  const entries: MaterialEntry[] = [
    {
      id: '1',
      trade: 'electrical',
      categoryId: 'elec-wires',
      categoryName: 'Electrical Wires',
      materialName: '2.5 sq.mm Wire',
      brand: 'Polycab',
      size: '2.5 sq.mm',
      specification: 'FRLS Copper',
      quantity: 3,
      unit: 'Roll',
      price: 2000,
      isCustom: false,
    },
    {
      id: '2',
      trade: 'plumbing',
      categoryId: 'plumb-cpvc',
      categoryName: 'CPVC Pipes',
      materialName: '20mm CPVC Pipe',
      brand: 'Ashirvad',
      size: '20mm',
      specification: 'SDR 11',
      quantity: 10,
      unit: 'Nos',
      isCustom: false,
    },
  ];

  const totals = computeListTotals(entries);
  assert.equal(totals.totalItems, 2);
  assert.equal(totals.electricalCount, 1);
  assert.equal(totals.plumbingCount, 1);
  assert.equal(totals.estimatedPriceTotal, 6000);

  const combined = groupMaterialsForExport(entries, 'combined');
  assert.equal(combined.length, 2);
  const elecOnly = groupMaterialsForExport(entries, 'electrical');
  assert.equal(elecOnly.length, 1);
  assert.equal(elecOnly[0].trade, 'electrical');
});

test('splitScriptRuns cleanly segments mixed Tamil and English text', () => {
  const runs = splitScriptRuns('2.5 sq.mm வயர் - Polycab');
  assert.equal(runs.length, 3);
  assert.equal(runs[0].isTamil, false);
  assert.equal(runs[1].isTamil, true);
  assert.equal(runs[2].isTamil, false);
});

test('buildWhatsAppShareText and sanitizePdfFilename produce valid output', () => {
  const details = {
    ...createEmptySiteDetails(),
    preparedBy: 'Murugan',
    mobileNumber: '9876543210',
    siteName: 'Anna Nagar House #2',
    date: '2026-11-24',
  };
  const filename = sanitizePdfFilename(details, 'combined');
  assert.equal(filename, 'SiteListPro_Anna_Nagar_House_2_combined_2026-11-24.pdf');

  const msg = buildWhatsAppShareText(details, [], 'combined', 'en');
  assert.ok(msg.includes('SITELIST PRO'));
  assert.ok(msg.includes('Murugan'));
});

test('generateMaterialListPdfBytes generates a real multi-script A4 PDF with Tamil Unicode', async () => {
  const fontsDir = path.resolve(process.cwd(), 'public/fonts');
  const fontBytes = {
    latinRegular: new Uint8Array(fs.readFileSync(path.join(fontsDir, 'NotoSans-Regular.ttf'))),
    latinBold: new Uint8Array(fs.readFileSync(path.join(fontsDir, 'NotoSans-Bold.ttf'))),
    tamilRegular: new Uint8Array(fs.readFileSync(path.join(fontsDir, 'NotoSansTamil-Regular.ttf'))),
    tamilBold: new Uint8Array(fs.readFileSync(path.join(fontsDir, 'NotoSansTamil-Bold.ttf'))),
  };

  const details = {
    ...createEmptySiteDetails(),
    preparedBy: 'கார்த்திக் / Karthik',
    mobileNumber: '9876543210',
    siteName: 'கிரீன் வேலி / Green Valley',
    customerName: 'ரமேஷ்',
    customerMobile: '9840012345',
    siteAddress: 'சென்னை / Chennai',
    totalSqFt: '1400',
    numberOfFloors: '2',
  };

  const entries: MaterialEntry[] = [
    {
      id: 'e1',
      trade: 'electrical',
      categoryId: 'elec-wires',
      categoryName: 'மின்சார வயர்கள் / Electrical Wires',
      materialName: '2.5 சதுர மி.மீ வயர் / 2.5 sq.mm Wire',
      brand: 'Polycab',
      size: '2.5 sq.mm',
      specification: 'FRLS Copper',
      quantity: 4,
      unit: 'Roll',
      price: 2150,
      notes: 'Red, Yellow, Blue, Black',
      isCustom: false,
    },
    {
      id: 'p1',
      trade: 'plumbing',
      categoryId: 'plumb-cpvc',
      categoryName: 'சிபிவிசி குழாய்கள் / CPVC Pipes',
      materialName: '20 மி.மீ சிபிவிசி பைப்',
      brand: 'Ashirvad',
      size: '20mm x 3m',
      specification: 'SDR 11',
      quantity: 12,
      unit: 'Nos',
      isCustom: false,
    },
  ];

  const bytes = await generateMaterialListPdfBytes({
    details,
    entries,
    scope: 'combined',
    lang: 'ta',
    includePrice: true,
    generalNotes: 'காலையில் 9 மணிக்கு டெலிவரி செய்யவும்.',
    fontBytes,
  });

  const header = new TextDecoder().decode(bytes.slice(0, 5));
  assert.equal(header, '%PDF-');
  assert.ok(bytes.length > 5000);
});
