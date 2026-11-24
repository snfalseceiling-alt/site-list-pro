import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileDown,
  MessageCircle,
  PlusCircle,
  Printer,
  Share2,
  Wrench,
  Zap,
} from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type {
  AppScreen,
  Language,
  ListScope,
  MaterialEntry,
  SiteDetails,
} from '../types/material';
import {
  buildWhatsAppShareText,
  computeListTotals,
  filterEntriesByScope,
  groupMaterialsForExport,
  sanitizePdfFilename,
} from '../utils/calculations';
import { generateMaterialListPdfBytes } from '../utils/pdfGenerator';
import { cn } from '../utils/cn';

interface PdfGeneratorScreenProps {
  details: SiteDetails;
  entries: MaterialEntry[];
  lang: Language;
  t: Translations;
  onNavigate: (screen: AppScreen) => void;
  onResetList: () => void;
}

export function PdfGeneratorScreen({
  details,
  entries,
  lang,
  t,
  onNavigate,
  onResetList,
}: PdfGeneratorScreenProps) {
  const totals = computeListTotals(entries);
  const [scope, setScope] = useState<ListScope>('combined');
  const [includePrice, setIncludePrice] = useState(totals.pricedItemsCount > 0);
  const [generalNotes, setGeneralNotes] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmNewList, setConfirmNewList] = useState(false);

  const scopedEntries = filterEntriesByScope(entries, scope);
  const scopedTotals = computeListTotals(scopedEntries);
  const grouped = groupMaterialsForExport(entries, scope);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Clear stale generated PDF when inputs change
  useEffect(() => {
    setPdfBlob(null);
    setActionMessage(null);
    setErrorMessage(null);
  }, [scope, includePrice, generalNotes, entries, details, lang]);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleGeneratePdf = async () => {
    if (scopedEntries.length === 0) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setActionMessage(null);

    try {
      const bytes = await generateMaterialListPdfBytes({
        details,
        entries,
        scope,
        lang,
        includePrice,
        generalNotes,
      });
      const arrayBuffer = bytes.slice().buffer;
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const filename = sanitizePdfFilename(details, scope);

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfBlob(blob);
      setPdfUrl(URL.createObjectURL(blob));
      setPdfFilename(filename);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to generate PDF in browser.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    triggerDownload(pdfBlob, pdfFilename);
  };

  const handleSharePdf = async () => {
    if (!pdfBlob) return;
    const file = new File([pdfBlob], pdfFilename, { type: 'application/pdf' });

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          title: pdfFilename,
          text: `${t.brandName} — ${details.siteName || details.preparedBy}`,
          files: [file],
        });
        setActionMessage(t.shareConfirmedMsg);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback when native file sharing is unavailable
    triggerDownload(pdfBlob, pdfFilename);
    setActionMessage(t.shareNotSupportedMsg);
  };

  const handleWhatsAppShare = () => {
    if (!pdfBlob) return;
    triggerDownload(pdfBlob, pdfFilename);
    const text = buildWhatsAppShareText(details, entries, scope, lang);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionMessage(t.whatsappFallbackNotice);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-1 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-[#0F294A]">{t.pdfTitle}</h1>
        <p className="text-sm text-slate-600">{t.pdfSubtitle}</p>
      </div>

      {entries.length === 0 ? (
        <div className="no-print flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-[#0F294A]">{t.emptyListTitle}</h2>
          <p className="max-w-md text-sm text-slate-600">{t.emptyListDesc}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
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
        <div className="grid min-w-0 gap-6 lg:grid-cols-12">
          {/* Left Controls Column */}
          <div className="no-print min-w-0 space-y-5 lg:col-span-5">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="space-y-2">
                <span className="block text-sm font-semibold text-[#0F294A]">
                  {t.pdfScopeLabel}
                </span>
                <div className="grid gap-2">
                  {(
                    [
                      { id: 'combined', label: t.scopeCombined, count: totals.totalItems },
                      { id: 'electrical', label: t.scopeElectrical, count: totals.electricalCount },
                      { id: 'plumbing', label: t.scopePlumbing, count: totals.plumbingCount },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={opt.count === 0}
                      onClick={() => setScope(opt.id)}
                      className={cn(
                        'flex min-h-[44px] items-center justify-between rounded-xl border px-3.5 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                        scope === opt.id
                          ? 'border-blue-700 bg-blue-50 text-[#0F294A] font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <span>{opt.label}</span>
                      <span className="text-xs font-semibold text-slate-500 tabular-nums">
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                <input
                  type="checkbox"
                  checked={includePrice}
                  onChange={(e) => setIncludePrice(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-[#0F294A]">
                  {t.includePriceLabel}
                </span>
              </label>

              <div className="space-y-1.5">
                <label
                  htmlFor="general-pdf-notes"
                  className="block text-sm font-semibold text-[#0F294A]"
                >
                  {t.listNotesLabel}
                </label>
                <textarea
                  id="general-pdf-notes"
                  rows={3}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder={t.listNotesPlaceholder}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-600"
                />
              </div>

              <button
                type="button"
                disabled={isGenerating || scopedEntries.length === 0}
                onClick={handleGeneratePdf}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0F294A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#173B68] disabled:opacity-50"
              >
                <FileDown className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{isGenerating ? t.generatingPdfLabel : t.generatePdfBtn}</span>
              </button>

              {errorMessage && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Post-Generation PDF Actions (Screen 10) */}
            {pdfBlob && (
              <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <div className="flex items-start gap-2.5 text-sm text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{t.pdfReadyNotice}</p>
                    <p className="mt-0.5 text-xs text-emerald-800 break-all">{pdfFilename}</p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0F294A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173B68]"
                  >
                    <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t.downloadPdfBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSharePdf}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    <Share2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t.sharePdfBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t.whatsappShareBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F294A] hover:bg-slate-50"
                  >
                    <Printer className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t.printPdfBtn}</span>
                  </button>
                </div>

                {!confirmNewList ? (
                  <button
                    type="button"
                    onClick={() => setConfirmNewList(true)}
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <PlusCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t.createNewListBtn}</span>
                  </button>
                ) : (
                  <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
                    <p className="font-medium text-amber-950">{t.confirmNewListPrompt}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmNewList(false);
                          onResetList();
                        }}
                        className="min-h-[36px] rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"
                      >
                        {t.confirmNewListYes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmNewList(false)}
                        className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {t.cancelBtn}
                      </button>
                    </div>
                  </div>
                )}

                {actionMessage && (
                  <p className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700">
                    {actionMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Live A4 Document Preview (also used cleanly for browser Print) */}
          <div className="min-w-0 lg:col-span-7">
            <div className="no-print mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">{t.pdfPreviewTitle}</h2>
              <span className="text-xs text-slate-500 tabular-nums">
                A4 · {scopedTotals.totalItems} {t.itemsCountSuffix}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-7 print:rounded-none print:border-0 print:p-0 print:shadow-none">
              {/* Document Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0F294A] px-4 py-3 text-white">
                <div>
                  <p className="text-base font-bold tracking-wide">SITELIST PRO</p>
                  <p className="text-xs text-slate-200">{t.pdfDocTitle}</p>
                </div>
                {details.date && (
                  <span className="text-xs font-semibold tabular-nums">
                    {t.dateLabel}: {details.date}
                  </span>
                )}
              </div>

              {/* Site & Tradesperson Meta */}
              <div className="mt-4 grid gap-x-6 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-slate-500">{t.preparedBy}: </span>
                  <span className="font-semibold text-slate-900">
                    {details.preparedBy || '—'}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">{t.mobileNumber}: </span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {details.mobileNumber || '—'}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">{t.siteName}: </span>
                  <span className="text-slate-900">{details.siteName || '—'}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">{t.customerName}: </span>
                  <span className="text-slate-900">{details.customerName || '—'}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">{t.customerMobile}: </span>
                  <span className="text-slate-900 tabular-nums">
                    {details.customerMobile || '—'}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">{t.buildingType}: </span>
                  <span className="text-slate-900">{details.buildingType}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">{t.totalSqFt}: </span>
                  <span className="text-slate-900 tabular-nums">
                    {details.totalSqFt ? `${details.totalSqFt} sq.ft` : '—'} ·{' '}
                    {details.numberOfFloors || '1'} floor(s)
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">{t.siteAddress}: </span>
                  <span className="text-slate-900">{details.siteAddress || '—'}</span>
                </p>
              </div>

              {/* Categorized Material Preview Tables */}
              <div className="mt-5 space-y-5">
                {grouped.map((tradeGroup) => {
                  const categoriesWithOffset = tradeGroup.categories.reduce<
                    { categoryName: string; items: MaterialEntry[]; startIndex: number }[]
                  >((acc, cat) => {
                    const prev = acc[acc.length - 1];
                    const startIndex = prev ? prev.startIndex + prev.items.length : 0;
                    acc.push({
                      categoryName: cat.categoryName,
                      items: cat.items,
                      startIndex,
                    });
                    return acc;
                  }, []);

                  return (
                    <div key={tradeGroup.trade} className="space-y-2">
                      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0F294A]">
                        {tradeGroup.trade === 'electrical'
                          ? t.electricalCardTitle.toUpperCase()
                          : t.plumbingCardTitle.toUpperCase()}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="bg-[#0F294A] text-white">
                              <th className="px-2 py-1.5 text-center">{t.colSNo}</th>
                              <th className="px-2 py-1.5">{t.colMaterial}</th>
                              <th className="px-2 py-1.5">{t.colBrand}</th>
                              <th className="px-2 py-1.5">{t.colSize}</th>
                              <th className="px-2 py-1.5">{t.colSpec}</th>
                              <th className="px-2 py-1.5 text-right">{t.colQty}</th>
                              <th className="px-2 py-1.5 text-center">{t.colUnit}</th>
                              {includePrice && (
                                <th className="px-2 py-1.5 text-right">{t.colPrice}</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {categoriesWithOffset.map((cat) => (
                              <FragmentRows
                                key={cat.categoryName}
                                categoryName={cat.categoryName}
                                items={cat.items}
                                includePrice={includePrice}
                                startIndex={cat.startIndex}
                                noBrandLabel={t.noBrandOption}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {includePrice && scopedTotals.estimatedPriceTotal > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900">
                  <span>{t.estimatedAmountMetric}</span>
                  <span className="tabular-nums">
                    ₹{scopedTotals.estimatedPriceTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {generalNotes.trim() && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-[#0F294A]">{t.listNotesLabel}</p>
                  <p className="mt-1 whitespace-pre-line text-slate-700">{generalNotes}</p>
                </div>
              )}

              {/* Signatures Preview */}
              <div className="mt-8 grid grid-cols-2 gap-8 pt-4 text-xs text-slate-500">
                <div className="border-t border-slate-300 pt-1.5">
                  <p className="font-semibold">{t.signaturePreparedBy}</p>
                  {details.preparedBy && (
                    <p className="text-slate-700">{details.preparedBy}</p>
                  )}
                </div>
                <div className="border-t border-slate-300 pt-1.5">
                  <p className="font-semibold">{t.signatureCustomer}</p>
                  {details.customerName && (
                    <p className="text-slate-700">{details.customerName}</p>
                  )}
                </div>
              </div>

              <p className="mt-6 border-t border-slate-200 pt-3 text-center text-[11px] font-semibold tracking-wide text-slate-500">
                {t.brandMotto}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FragmentRows({
  categoryName,
  items,
  includePrice,
  startIndex,
  noBrandLabel,
}: {
  categoryName: string;
  items: MaterialEntry[];
  includePrice: boolean;
  startIndex: number;
  noBrandLabel: string;
}) {
  return (
    <>
      <tr className="border-b border-slate-200 bg-slate-100">
        <td
          colSpan={includePrice ? 8 : 7}
          className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-800"
        >
          {categoryName}
        </td>
      </tr>
      {items.map((item, idx) => {
        const lineTotal =
          includePrice && typeof item.price === 'number' && item.price > 0
            ? item.price * item.quantity
            : null;
        return (
          <tr key={item.id} className="border-b border-slate-100">
            <td className="px-2 py-1.5 text-center text-slate-500 tabular-nums">
              {startIndex + idx + 1}
            </td>
            <td className="px-2 py-1.5">
              <span className="font-semibold text-slate-900">{item.materialName}</span>
              {item.notes && (
                <p className="text-[11px] text-slate-500">Note: {item.notes}</p>
              )}
            </td>
            <td className="px-2 py-1.5 text-slate-700">
              {item.brand && item.brand !== 'No Brand' ? item.brand : noBrandLabel}
            </td>
            <td className="px-2 py-1.5 text-slate-700">{item.size || '—'}</td>
            <td className="px-2 py-1.5 text-slate-600">{item.specification || '—'}</td>
            <td className="px-2 py-1.5 text-right font-bold text-[#0F294A] tabular-nums">
              {item.quantity}
            </td>
            <td className="px-2 py-1.5 text-center text-slate-700">{item.unit}</td>
            {includePrice && (
              <td className="px-2 py-1.5 text-right text-slate-800 tabular-nums">
                {lineTotal !== null ? `₹${lineTotal.toLocaleString('en-IN')}` : '—'}
              </td>
            )}
          </tr>
        );
      })}
    </>
  );
}
