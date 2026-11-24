import 'regenerator-runtime/runtime';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Language, ListScope, MaterialEntry, SiteDetails } from '../types/material';
import { computeListTotals, filterEntriesByScope, groupMaterialsForExport } from './calculations';

export interface FontBytesBundle {
  latinRegular: Uint8Array;
  latinBold: Uint8Array;
  tamilRegular: Uint8Array;
  tamilBold: Uint8Array;
}

export interface PdfGenerationOptions {
  details: SiteDetails;
  entries: MaterialEntry[];
  scope: ListScope;
  lang: Language;
  includePrice: boolean;
  generalNotes: string;
  fontBytes?: FontBytesBundle;
}

interface TextRun {
  text: string;
  isTamil: boolean;
}

const TAMIL_CHAR_REGEX = /[\u0B80-\u0BFF]/;

/**
 * Splits text into contiguous Tamil vs non-Tamil runs so each script renders
 * with its dedicated Noto Sans / Noto Sans Tamil OpenType font.
 */
export function splitScriptRuns(text: string): TextRun[] {
  if (!text) return [];
  const runs: TextRun[] = [];
  let currentText = '';
  let currentIsTamil = TAMIL_CHAR_REGEX.test(text[0]);

  for (const ch of text) {
    const isTamil = TAMIL_CHAR_REGEX.test(ch);
    if (isTamil === currentIsTamil) {
      currentText += ch;
    } else {
      if (currentText) runs.push({ text: currentText, isTamil: currentIsTamil });
      currentText = ch;
      currentIsTamil = isTamil;
    }
  }
  if (currentText) runs.push({ text: currentText, isTamil: currentIsTamil });
  return runs;
}

function sanitizeUnsupportedChars(text: string): string {
  // Replace Indian Rupee symbol with Rs. if needed for guaranteed NotoSans glyph coverage,
  // and normalize newlines/tabs.
  return text.replace(/\u20B9/g, 'Rs. ').replace(/\t/g, ' ').replace(/\r/g, '');
}

function measureMixedTextWidth(
  text: string,
  size: number,
  latinFont: PDFFont,
  tamilFont: PDFFont
): number {
  const safe = sanitizeUnsupportedChars(text);
  const runs = splitScriptRuns(safe);
  let width = 0;
  for (const run of runs) {
    const font = run.isTamil ? tamilFont : latinFont;
    width += font.widthOfTextAtSize(run.text, size);
  }
  return width;
}

function drawMixedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  latinFont: PDFFont,
  tamilFont: PDFFont,
  color = rgb(0.06, 0.09, 0.16),
  align: 'left' | 'right' | 'center' = 'left',
  maxBoxWidth = 0
): void {
  const safe = sanitizeUnsupportedChars(text);
  const totalWidth = measureMixedTextWidth(safe, size, latinFont, tamilFont);

  let cursorX = x;
  if (align === 'right' && maxBoxWidth > 0) {
    cursorX = x + maxBoxWidth - totalWidth;
  } else if (align === 'center' && maxBoxWidth > 0) {
    cursorX = x + (maxBoxWidth - totalWidth) / 2;
  }

  const runs = splitScriptRuns(safe);
  for (const run of runs) {
    const font = run.isTamil ? tamilFont : latinFont;
    page.drawText(run.text, {
      x: cursorX,
      y,
      size,
      font,
      color,
    });
    cursorX += font.widthOfTextAtSize(run.text, size);
  }
}

function wrapMixedText(
  text: string,
  maxWidth: number,
  size: number,
  latinFont: PDFFont,
  tamilFont: PDFFont
): string[] {
  const clean = sanitizeUnsupportedChars(text).trim();
  if (!clean) return ['-'];

  const paragraphs = clean.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const w = measureMixedTextWidth(candidate, size, latinFont, tamilFont);
      if (w <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Hard split long token
          let chunk = '';
          for (const ch of word) {
            if (measureMixedTextWidth(chunk + ch, size, latinFont, tamilFont) > maxWidth && chunk) {
              lines.push(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          currentLine = chunk;
        }
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  return lines.length > 0 ? lines : ['-'];
}

export async function loadDefaultFontsFromPublic(): Promise<FontBytesBundle> {
  const [latinRegRes, latinBoldRes, tamilRegRes, tamilBoldRes] = await Promise.all([
    fetch('/fonts/NotoSans-Regular.ttf'),
    fetch('/fonts/NotoSans-Bold.ttf'),
    fetch('/fonts/NotoSansTamil-Regular.ttf'),
    fetch('/fonts/NotoSansTamil-Bold.ttf'),
  ]);

  if (!latinRegRes.ok || !latinBoldRes.ok || !tamilRegRes.ok || !tamilBoldRes.ok) {
    throw new Error('Failed to load bundled Unicode PDF fonts.');
  }

  const [latinRegular, latinBold, tamilRegular, tamilBold] = await Promise.all([
    latinRegRes.arrayBuffer().then((b) => new Uint8Array(b)),
    latinBoldRes.arrayBuffer().then((b) => new Uint8Array(b)),
    tamilRegRes.arrayBuffer().then((b) => new Uint8Array(b)),
    tamilBoldRes.arrayBuffer().then((b) => new Uint8Array(b)),
  ]);

  return { latinRegular, latinBold, tamilRegular, tamilBold };
}

export async function generateMaterialListPdfBytes(
  options: PdfGenerationOptions
): Promise<Uint8Array> {
  const { details, entries, scope, lang, includePrice, generalNotes } = options;
  const fonts = options.fontBytes ?? (await loadDefaultFontsFromPublic());

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const latinRegular = await pdfDoc.embedFont(fonts.latinRegular, { subset: true });
  const latinBold = await pdfDoc.embedFont(fonts.latinBold, { subset: true });
  const tamilRegular = await pdfDoc.embedFont(fonts.tamilRegular, { subset: true });
  const tamilBold = await pdfDoc.embedFont(fonts.tamilBold, { subset: true });

  // A4 dimensions in PDF points (72 dpi)
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_X = 32;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2; // 531.28
  const BOTTOM_LIMIT = 56;

  const NAVY = rgb(0.06, 0.16, 0.29);
  const BLUE = rgb(0.11, 0.31, 0.85);
  const SLATE_DARK = rgb(0.06, 0.09, 0.16);
  const SLATE_MUTED = rgb(0.39, 0.45, 0.55);
  const BORDER_LIGHT = rgb(0.84, 0.87, 0.91);
  const BG_SOFT = rgb(0.95, 0.97, 0.99);
  const WHITE = rgb(1, 1, 1);

  const labels =
    lang === 'ta'
      ? {
          title: 'SITELIST PRO',
          subtitle: 'மின்சாரம் & பிளம்பிங் பொருட்கள் தேவைப் பட்டியல்',
          preparedBy: 'தயாரிப்பவர்',
          mobile: 'மொபைல் எண்',
          siteName: 'தளம்',
          customerName: 'வாடிக்கையாளர்',
          customerMobile: 'வாடிக்கையாளர் எண்',
          siteAddress: 'முகவரி',
          buildingType: 'கட்டிட வகை',
          sqFt: 'சதுர அடி / தளம்',
          date: 'தேதி',
          electricalHeading: 'மின்சார பொருட்கள் (ELECTRICAL MATERIALS)',
          plumbingHeading: 'பிளம்பிங் பொருட்கள் (PLUMBING MATERIALS)',
          sNo: 'வ.எண்',
          material: 'பொருள்',
          brand: 'பிராண்ட்',
          size: 'அளவு',
          spec: 'விவரம்',
          qty: 'அளவு',
          unit: 'அலகு',
          price: 'விலை',
          notes: 'பொதுவான குறிப்புகள்:',
          estTotal: 'மதிப்பீட்டு மொத்தத் தொகை (உள்ளிட்ட விலைகள்):',
          sigPrepared: 'தயாரிப்பவர் கையொப்பம்',
          sigCustomer: 'வாடிக்கையாளர் / ஒப்பந்ததாரர் கையொப்பம்',
          footer: 'SITELIST PRO - SELECT MATERIALS. ADD BRANDS. GENERATE PDF. DONE.',
          pageWord: 'பக்கம்',
          ofWord: '/',
          noBrand: 'பிராண்ட் இல்லை',
        }
      : {
          title: 'SITELIST PRO',
          subtitle: 'Electrical & Plumbing Material Requirement List',
          preparedBy: 'Prepared By',
          mobile: 'Mobile Number',
          siteName: 'Site Name',
          customerName: 'Customer Name',
          customerMobile: 'Customer Mobile',
          siteAddress: 'Site Address',
          buildingType: 'Building Type',
          sqFt: 'Square Feet / Floors',
          date: 'Date',
          electricalHeading: 'ELECTRICAL MATERIALS',
          plumbingHeading: 'PLUMBING MATERIALS',
          sNo: 'S.No',
          material: 'Material Name',
          brand: 'Brand',
          size: 'Size',
          spec: 'Specification',
          qty: 'Qty',
          unit: 'Unit',
          price: 'Price',
          notes: 'General Notes:',
          estTotal: 'Estimated Total (Entered Prices Only):',
          sigPrepared: 'Prepared By (Signature)',
          sigCustomer: 'Customer / Contractor (Signature)',
          footer: 'SITELIST PRO - SELECT MATERIALS. ADD BRANDS. GENERATE PDF. DONE.',
          pageWord: 'Page',
          ofWord: 'of',
          noBrand: 'No Brand',
        };

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - 32;

  const drawHeaderBanner = (p: PDFPage, isFirstPage: boolean): number => {
    let y = PAGE_HEIGHT - 32;
    if (isFirstPage) {
      // Top Navy Banner
      p.drawRectangle({
        x: MARGIN_X,
        y: y - 48,
        width: CONTENT_WIDTH,
        height: 48,
        color: NAVY,
      });
      drawMixedText(p, labels.title, MARGIN_X + 14, y - 22, 16, latinBold, tamilBold, WHITE);
      drawMixedText(
        p,
        labels.subtitle,
        MARGIN_X + 14,
        y - 38,
        9.5,
        latinRegular,
        tamilRegular,
        rgb(0.82, 0.89, 0.98)
      );
      if (details.date) {
        drawMixedText(
          p,
          `${labels.date}: ${details.date}`,
          MARGIN_X + CONTENT_WIDTH - 140,
          y - 26,
          9,
          latinBold,
          tamilBold,
          WHITE,
          'right',
          126
        );
      }

      y -= 58;

      // Project & User Details Grid Box
      const boxHeight = 82;
      p.drawRectangle({
        x: MARGIN_X,
        y: y - boxHeight,
        width: CONTENT_WIDTH,
        height: boxHeight,
        color: BG_SOFT,
        borderColor: BORDER_LIGHT,
        borderWidth: 0.75,
      });

      const col1X = MARGIN_X + 10;
      const col2X = MARGIN_X + CONTENT_WIDTH / 2 + 6;
      const colW = CONTENT_WIDTH / 2 - 18;

      const drawMetaRow = (lx: number, ly: number, k: string, v: string) => {
        const labelStr = `${k}: `;
        drawMixedText(p, labelStr, lx, ly, 8.2, latinBold, tamilBold, SLATE_MUTED);
        const lw = measureMixedTextWidth(labelStr, 8.2, latinBold, tamilBold);
        const valText = v.trim() || '-';
        const wrapped = wrapMixedText(valText, Math.max(40, colW - lw), 8.2, latinRegular, tamilRegular);
        drawMixedText(p, wrapped[0], lx + lw, ly, 8.2, latinRegular, tamilRegular, SLATE_DARK);
      };

      drawMetaRow(col1X, y - 16, labels.preparedBy, details.preparedBy);
      drawMetaRow(col2X, y - 16, labels.mobile, details.mobileNumber);

      drawMetaRow(col1X, y - 31, labels.siteName, details.siteName);
      drawMetaRow(col2X, y - 31, labels.customerName, details.customerName);

      drawMetaRow(col1X, y - 46, labels.customerMobile, details.customerMobile);
      drawMetaRow(col2X, y - 46, labels.buildingType, details.buildingType);

      const sqFtText = details.totalSqFt
        ? `${details.totalSqFt} sq.ft / ${details.numberOfFloors || '1'} floor(s)`
        : `${details.numberOfFloors || '1'} floor(s)`;
      drawMetaRow(col1X, y - 61, labels.sqFt, sqFtText);
      drawMetaRow(col2X, y - 61, labels.siteAddress, details.siteAddress);

      y -= boxHeight + 14;
      return y;
    }

    // Continuation header on subsequent pages
    drawMixedText(
      p,
      `${labels.title} — ${details.siteName || details.preparedBy || labels.subtitle}`,
      MARGIN_X,
      y - 12,
      9,
      latinBold,
      tamilBold,
      NAVY
    );
    p.drawLine({
      start: { x: MARGIN_X, y: y - 18 },
      end: { x: MARGIN_X + CONTENT_WIDTH, y: y - 18 },
      thickness: 0.75,
      color: BORDER_LIGHT,
    });
    return y - 30;
  };

  cursorY = drawHeaderBanner(page, true);

  const ensureSpace = (neededHeight: number) => {
    if (cursorY - neededHeight < BOTTOM_LIMIT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursorY = drawHeaderBanner(page, false);
    }
  };

  // Column layout (sum = CONTENT_WIDTH = 531.28)
  const cols = includePrice
    ? [
        { key: 'sno', label: labels.sNo, width: 28, align: 'center' as const },
        { key: 'material', label: labels.material, width: 142, align: 'left' as const },
        { key: 'brand', label: labels.brand, width: 72, align: 'left' as const },
        { key: 'size', label: labels.size, width: 64, align: 'left' as const },
        { key: 'spec', label: labels.spec, width: 105, align: 'left' as const },
        { key: 'qty', label: labels.qty, width: 34, align: 'right' as const },
        { key: 'unit', label: labels.unit, width: 38, align: 'center' as const },
        { key: 'price', label: labels.price, width: 48.28, align: 'right' as const },
      ]
    : [
        { key: 'sno', label: labels.sNo, width: 30, align: 'center' as const },
        { key: 'material', label: labels.material, width: 158, align: 'left' as const },
        { key: 'brand', label: labels.brand, width: 82, align: 'left' as const },
        { key: 'size', label: labels.size, width: 74, align: 'left' as const },
        { key: 'spec', label: labels.spec, width: 111.28, align: 'left' as const },
        { key: 'qty', label: labels.qty, width: 36, align: 'right' as const },
        { key: 'unit', label: labels.unit, width: 40, align: 'center' as const },
      ];

  const drawTableHeader = () => {
    ensureSpace(24);
    const headerH = 20;
    page.drawRectangle({
      x: MARGIN_X,
      y: cursorY - headerH,
      width: CONTENT_WIDTH,
      height: headerH,
      color: NAVY,
    });
    let cx = MARGIN_X;
    for (const col of cols) {
      drawMixedText(
        page,
        col.label,
        cx + 4,
        cursorY - 13,
        7.8,
        latinBold,
        tamilBold,
        WHITE,
        col.align,
        col.width - 8
      );
      cx += col.width;
    }
    cursorY -= headerH;
  };

  const tradeGroups = groupMaterialsForExport(entries, scope);
  const scopedEntries = filterEntriesByScope(entries, scope);
  const totals = computeListTotals(scopedEntries);
  let serialNo = 1;

  for (const tradeGroup of tradeGroups) {
    ensureSpace(46);
    const tradeLabel =
      tradeGroup.trade === 'electrical' ? labels.electricalHeading : labels.plumbingHeading;

    page.drawRectangle({
      x: MARGIN_X,
      y: cursorY - 20,
      width: CONTENT_WIDTH,
      height: 20,
      color: rgb(0.91, 0.94, 0.98),
      borderColor: BLUE,
      borderWidth: 0.5,
    });
    drawMixedText(page, tradeLabel, MARGIN_X + 8, cursorY - 13, 9, latinBold, tamilBold, NAVY);
    cursorY -= 24;

    drawTableHeader();

    for (const cat of tradeGroup.categories) {
      ensureSpace(38);
      // Category subheader row
      page.drawRectangle({
        x: MARGIN_X,
        y: cursorY - 17,
        width: CONTENT_WIDTH,
        height: 17,
        color: BG_SOFT,
        borderColor: BORDER_LIGHT,
        borderWidth: 0.5,
      });
      drawMixedText(
        page,
        cat.categoryName.toUpperCase(),
        MARGIN_X + 6,
        cursorY - 11.5,
        7.8,
        latinBold,
        tamilBold,
        BLUE
      );
      cursorY -= 17;

      for (const item of cat.items) {
        const brandVal =
          !item.brand || item.brand === 'No Brand' ? labels.noBrand : item.brand;
        const materialText = item.notes?.trim()
          ? `${item.materialName}\nNote: ${item.notes.trim()}`
          : item.materialName;
        const sizeVal = item.size.trim() || '-';
        const specVal = item.specification.trim() || '-';
        const qtyVal = String(item.quantity);
        const unitVal = item.unit;
        const priceVal =
          includePrice && typeof item.price === 'number' && item.price > 0
            ? `Rs.${(item.price * item.quantity).toFixed(0)}`
            : '-';

        const matLines = wrapMixedText(materialText, cols[1].width - 8, 8, latinRegular, tamilRegular);
        const brandLines = wrapMixedText(brandVal, cols[2].width - 8, 8, latinRegular, tamilRegular);
        const sizeLines = wrapMixedText(sizeVal, cols[3].width - 8, 8, latinRegular, tamilRegular);
        const specLines = wrapMixedText(specVal, cols[4].width - 8, 8, latinRegular, tamilRegular);

        const maxLines = Math.max(
          matLines.length,
          brandLines.length,
          sizeLines.length,
          specLines.length,
          1
        );
        const lineHeight = 10.5;
        const rowH = Math.max(19, maxLines * lineHeight + 8);

        if (cursorY - rowH < BOTTOM_LIMIT) {
          page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          cursorY = drawHeaderBanner(page, false);
          drawTableHeader();
        }

        page.drawRectangle({
          x: MARGIN_X,
          y: cursorY - rowH,
          width: CONTENT_WIDTH,
          height: rowH,
          color: serialNo % 2 === 0 ? rgb(0.99, 0.99, 1) : WHITE,
          borderColor: BORDER_LIGHT,
          borderWidth: 0.4,
        });

        let cx = MARGIN_X;
        const topTextY = cursorY - 12;

        // S.No
        drawMixedText(
          page,
          String(serialNo),
          cx + 4,
          topTextY,
          8,
          latinBold,
          tamilBold,
          SLATE_DARK,
          'center',
          cols[0].width - 8
        );
        cx += cols[0].width;

        // Material (+ Note)
        matLines.forEach((line, idx) => {
          const isNote = line.startsWith('Note:');
          drawMixedText(
            page,
            line,
            cx + 4,
            topTextY - idx * lineHeight,
            isNote ? 7.2 : 8,
            isNote ? latinRegular : latinBold,
            isNote ? tamilRegular : tamilBold,
            isNote ? SLATE_MUTED : SLATE_DARK
          );
        });
        cx += cols[1].width;

        // Brand
        brandLines.forEach((line, idx) => {
          drawMixedText(
            page,
            line,
            cx + 4,
            topTextY - idx * lineHeight,
            8,
            latinRegular,
            tamilRegular,
            brandVal === labels.noBrand ? SLATE_MUTED : SLATE_DARK
          );
        });
        cx += cols[2].width;

        // Size
        sizeLines.forEach((line, idx) => {
          drawMixedText(
            page,
            line,
            cx + 4,
            topTextY - idx * lineHeight,
            8,
            latinRegular,
            tamilRegular,
            SLATE_DARK
          );
        });
        cx += cols[3].width;

        // Spec
        specLines.forEach((line, idx) => {
          drawMixedText(
            page,
            line,
            cx + 4,
            topTextY - idx * lineHeight,
            7.8,
            latinRegular,
            tamilRegular,
            SLATE_MUTED
          );
        });
        cx += cols[4].width;

        // Qty
        drawMixedText(
          page,
          qtyVal,
          cx + 4,
          topTextY,
          8.5,
          latinBold,
          tamilBold,
          NAVY,
          'right',
          cols[5].width - 8
        );
        cx += cols[5].width;

        // Unit
        drawMixedText(
          page,
          unitVal,
          cx + 4,
          topTextY,
          8,
          latinRegular,
          tamilRegular,
          SLATE_DARK,
          'center',
          cols[6].width - 8
        );
        cx += cols[6].width;

        // Price (optional)
        if (includePrice && cols[7]) {
          drawMixedText(
            page,
            priceVal,
            cx + 4,
            topTextY,
            8,
            latinRegular,
            tamilRegular,
            SLATE_DARK,
            'right',
            cols[7].width - 8
          );
        }

        cursorY -= rowH;
        serialNo += 1;
      }
    }
    cursorY -= 10;
  }

  // Optional Estimated Price Total
  if (includePrice && totals.estimatedPriceTotal > 0) {
    ensureSpace(28);
    page.drawRectangle({
      x: MARGIN_X,
      y: cursorY - 22,
      width: CONTENT_WIDTH,
      height: 22,
      color: rgb(0.93, 0.97, 0.94),
      borderColor: rgb(0.13, 0.54, 0.29),
      borderWidth: 0.6,
    });
    drawMixedText(
      page,
      labels.estTotal,
      MARGIN_X + 10,
      cursorY - 14.5,
      8.5,
      latinBold,
      tamilBold,
      SLATE_DARK
    );
    drawMixedText(
      page,
      `Rs. ${totals.estimatedPriceTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      MARGIN_X + CONTENT_WIDTH - 150,
      cursorY - 14.5,
      9,
      latinBold,
      tamilBold,
      rgb(0.08, 0.45, 0.24),
      'right',
      140
    );
    cursorY -= 30;
  }

  // General Notes
  if (generalNotes.trim()) {
    const noteLines = wrapMixedText(
      generalNotes.trim(),
      CONTENT_WIDTH - 20,
      8.2,
      latinRegular,
      tamilRegular
    );
    const noteBoxH = noteLines.length * 11 + 24;
    ensureSpace(noteBoxH + 10);
    page.drawRectangle({
      x: MARGIN_X,
      y: cursorY - noteBoxH,
      width: CONTENT_WIDTH,
      height: noteBoxH,
      color: BG_SOFT,
      borderColor: BORDER_LIGHT,
      borderWidth: 0.6,
    });
    drawMixedText(page, labels.notes, MARGIN_X + 10, cursorY - 14, 8.2, latinBold, tamilBold, NAVY);
    noteLines.forEach((nl, idx) => {
      drawMixedText(
        page,
        nl,
        MARGIN_X + 10,
        cursorY - 26 - idx * 11,
        8.2,
        latinRegular,
        tamilRegular,
        SLATE_DARK
      );
    });
    cursorY -= noteBoxH + 14;
  }

  // Signature block
  ensureSpace(64);
  const sigY = Math.min(cursorY - 16, 130);
  const sigW = 200;

  page.drawLine({
    start: { x: MARGIN_X + 10, y: sigY - 26 },
    end: { x: MARGIN_X + 10 + sigW, y: sigY - 26 },
    thickness: 0.75,
    color: SLATE_MUTED,
  });
  drawMixedText(page, labels.sigPrepared, MARGIN_X + 10, sigY - 38, 8, latinBold, tamilBold, SLATE_MUTED);
  if (details.preparedBy.trim()) {
    drawMixedText(
      page,
      details.preparedBy.trim(),
      MARGIN_X + 10,
      sigY - 22,
      8.5,
      latinRegular,
      tamilRegular,
      SLATE_DARK
    );
  }

  const rightSigX = MARGIN_X + CONTENT_WIDTH - sigW - 10;
  page.drawLine({
    start: { x: rightSigX, y: sigY - 26 },
    end: { x: rightSigX + sigW, y: sigY - 26 },
    thickness: 0.75,
    color: SLATE_MUTED,
  });
  drawMixedText(page, labels.sigCustomer, rightSigX, sigY - 38, 8, latinBold, tamilBold, SLATE_MUTED);
  if (details.customerName.trim()) {
    drawMixedText(
      page,
      details.customerName.trim(),
      rightSigX,
      sigY - 22,
      8.5,
      latinRegular,
      tamilRegular,
      SLATE_DARK
    );
  }

  // Page numbering & footer across all pages
  const allPages = pdfDoc.getPages();
  const totalPages = allPages.length;
  allPages.forEach((p, idx) => {
    p.drawLine({
      start: { x: MARGIN_X, y: 38 },
      end: { x: MARGIN_X + CONTENT_WIDTH, y: 38 },
      thickness: 0.5,
      color: BORDER_LIGHT,
    });
    drawMixedText(p, labels.footer, MARGIN_X, 24, 7.2, latinRegular, tamilRegular, SLATE_MUTED);
    const pageStr = `${labels.pageWord} ${idx + 1} ${labels.ofWord} ${totalPages}`;
    drawMixedText(
      p,
      pageStr,
      MARGIN_X + CONTENT_WIDTH - 90,
      24,
      7.5,
      latinBold,
      tamilBold,
      SLATE_MUTED,
      'right',
      90
    );
  });

  return pdfDoc.save();
}
