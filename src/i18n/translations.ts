import type { Language } from '../types/material';

export interface Translations {
  brandName: string;
  tagline: string;
  brandMotto: string;
  navHome: string;
  navElectrical: string;
  navPlumbing: string;
  navList: string;
  navPdf: string;
  newListBtn: string;
  languageLabel: string;
  tempNoticeTitle: string;
  tempNoticeDesc: string;

  // Home
  homeHeading: string;
  homeDescription: string;
  electricalCardTitle: string;
  electricalCardDesc: string;
  plumbingCardTitle: string;
  plumbingCardDesc: string;
  createNewListAction: string;
  currentSummaryAction: string;
  generatePdfAction: string;
  siteDetailsAction: string;
  editSiteDetails: string;
  itemsInList: string;
  electricalItemsLabel: string;
  plumbingItemsLabel: string;
  readyToExport: string;
  noItemsYet: string;
  startWorkflowTitle: string;

  // Site Details
  detailsTitle: string;
  detailsSubtitle: string;
  preparedBy: string;
  preparedByPlaceholder: string;
  mobileNumber: string;
  mobilePlaceholder: string;
  siteName: string;
  siteNamePlaceholder: string;
  customerName: string;
  customerNamePlaceholder: string;
  customerMobile: string;
  customerMobilePlaceholder: string;
  siteAddress: string;
  siteAddressPlaceholder: string;
  buildingType: string;
  totalSqFt: string;
  sqFtPlaceholder: string;
  numberOfFloors: string;
  floorsPlaceholder: string;
  dateLabel: string;
  saveAndElectrical: string;
  saveAndPlumbing: string;
  saveDetailsOnly: string;
  detailsSavedMsg: string;
  requiredFieldsNote: string;

  // Catalogues
  electricalCatalogTitle: string;
  electricalCatalogSub: string;
  plumbingCatalogTitle: string;
  plumbingCatalogSub: string;
  searchMaterialsPlaceholder: string;
  addCustomMaterialBtn: string;
  allCategories: string;
  categoriesHeading: string;
  materialsHeading: string;
  selectMaterialBtn: string;
  itemsCountSuffix: string;
  noSearchResults: string;
  clearSearch: string;
  viewMaterialList: string;

  // Brand management
  brandFieldLabel: string;
  brandSearchPlaceholder: string;
  noBrandOption: string;
  addCustomBrandBtn: string;
  customBrandPlaceholder: string;
  editBrandBtn: string;
  saveBrandEditBtn: string;
  brandHelperNote: string;
  selectedBrandLabel: string;
  suggestedBrandsLabel: string;

  // Material Entry Modal
  addMaterialTitle: string;
  editMaterialTitle: string;
  customMaterialTitle: string;
  materialNameLabel: string;
  materialNamePlaceholder: string;
  categoryLabel: string;
  customCategoryOption: string;
  customCategoryPlaceholder: string;
  sizeLabel: string;
  sizePlaceholder: string;
  specificationLabel: string;
  specificationPlaceholder: string;
  quantityLabel: string;
  quantityModeManual: string;
  quantityModeEstimate: string;
  applyEstimateBtn: string;
  estimateDisclaimer: string;
  estimateNeedSqFt: string;
  unitLabel: string;
  priceLabel: string;
  priceOptionalHint: string;
  notesLabel: string;
  notesPlaceholder: string;
  addToListBtn: string;
  saveChangesBtn: string;
  cancelBtn: string;

  // List Summary
  summaryTitle: string;
  summarySubtitle: string;
  tabCombined: string;
  tabElectrical: string;
  tabPlumbing: string;
  colSNo: string;
  colMaterial: string;
  colBrand: string;
  colSize: string;
  colSpec: string;
  colQty: string;
  colUnit: string;
  colPrice: string;
  colAction: string;
  editAction: string;
  deleteAction: string;
  addMoreMaterials: string;
  clearListBtn: string;
  confirmClearPrompt: string;
  confirmYesClear: string;
  totalItemsMetric: string;
  estimatedAmountMetric: string;
  emptyListTitle: string;
  emptyListDesc: string;
  browseElectricalBtn: string;
  browsePlumbingBtn: string;

  // PDF Screen
  pdfTitle: string;
  pdfSubtitle: string;
  pdfScopeLabel: string;
  scopeCombined: string;
  scopeElectrical: string;
  scopePlumbing: string;
  includePriceLabel: string;
  listNotesLabel: string;
  listNotesPlaceholder: string;
  generatePdfBtn: string;
  generatingPdfLabel: string;
  pdfReadyNotice: string;
  downloadPdfBtn: string;
  sharePdfBtn: string;
  whatsappShareBtn: string;
  printPdfBtn: string;
  createNewListBtn: string;
  whatsappFallbackNotice: string;
  shareNotSupportedMsg: string;
  shareConfirmedMsg: string;
  pdfPreviewTitle: string;
  pdfDocTitle: string;
  signaturePreparedBy: string;
  signatureCustomer: string;
  confirmNewListPrompt: string;
  confirmNewListYes: string;

  // Validation
  errPreparedBy: string;
  errMobile: string;
  errMaterialName: string;
  errCategory: string;
  errQuantity: string;
  errPrice: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandName: 'SiteList Pro',
    tagline: 'Electrical & Plumbing Material List Generator',
    brandMotto: 'SITELIST PRO – SELECT MATERIALS. ADD BRANDS. GENERATE PDF. DONE.',
    navHome: 'Home',
    navElectrical: 'Electrical',
    navPlumbing: 'Plumbing',
    navList: 'Material List',
    navPdf: 'Generate PDF',
    newListBtn: 'New List',
    languageLabel: 'Language',
    tempNoticeTitle: 'Temporary Session Workspace',
    tempNoticeDesc:
      'All entries are kept temporarily in browser memory only. Closing or refreshing this tab will clear your list—export your PDF before leaving.',

    homeHeading: 'Create Your Material List',
    homeDescription:
      'Select electrical and plumbing materials, enter brands and quantities, and generate your A4 PDF for the hardware shop.',
    electricalCardTitle: 'Electrical Materials',
    electricalCardDesc: 'Wires, conduits, switches, boxes, MCB protection, lighting, and earthing.',
    plumbingCardTitle: 'Plumbing Materials',
    plumbingCardDesc: 'PVC, CPVC & UPVC pipes, fittings, valves, bathroom fixtures, drainage, and tanks.',
    createNewListAction: 'Create New List',
    currentSummaryAction: 'Current List Summary',
    generatePdfAction: 'Generate PDF',
    siteDetailsAction: 'Enter Site & User Details',
    editSiteDetails: 'Edit Site Details',
    itemsInList: 'items in current list',
    electricalItemsLabel: 'Electrical',
    plumbingItemsLabel: 'Plumbing',
    readyToExport: 'Ready for PDF export',
    noItemsYet: 'No materials added yet',
    startWorkflowTitle: 'Quick Actions',

    detailsTitle: 'Project & Tradesperson Details',
    detailsSubtitle:
      'Enter electrician or plumber contact and site information. Prepared By and Mobile Number will appear on your generated PDF.',
    preparedBy: 'Prepared By (Electrician / Plumber Name)',
    preparedByPlaceholder: 'e.g., Karthik S.',
    mobileNumber: 'Mobile Number',
    mobilePlaceholder: 'e.g., 9876543210',
    siteName: 'Site Name',
    siteNamePlaceholder: 'e.g., Green Valley Villa - Block B',
    customerName: 'Customer Name',
    customerNamePlaceholder: 'e.g., Ramesh Kumar',
    customerMobile: 'Customer Mobile Number',
    customerMobilePlaceholder: 'e.g., 9840012345',
    siteAddress: 'Site Address',
    siteAddressPlaceholder: 'Street, area, city',
    buildingType: 'Building Type',
    totalSqFt: 'Total Square Feet',
    sqFtPlaceholder: 'e.g., 1200',
    numberOfFloors: 'Number of Floors',
    floorsPlaceholder: 'e.g., 2',
    dateLabel: 'Date',
    saveAndElectrical: 'Continue to Electrical Catalogue',
    saveAndPlumbing: 'Continue to Plumbing Catalogue',
    saveDetailsOnly: 'Save Details',
    detailsSavedMsg: 'Project details updated for this session.',
    requiredFieldsNote: 'Fields marked with * appear on the PDF header and are required.',

    electricalCatalogTitle: 'Electrical Material Catalogue',
    electricalCatalogSub: 'Choose a category or search any electrical material to configure brand and quantity.',
    plumbingCatalogTitle: 'Plumbing Material Catalogue',
    plumbingCatalogSub: 'Choose a category or search any plumbing material to configure brand and quantity.',
    searchMaterialsPlaceholder: 'Search materials by name (English or Tamil)...',
    addCustomMaterialBtn: '+ Add Custom Material',
    allCategories: 'All Categories',
    categoriesHeading: 'Categories',
    materialsHeading: 'Materials',
    selectMaterialBtn: 'Select',
    itemsCountSuffix: 'items',
    noSearchResults: 'No matching catalogue items found. You can add it as a custom material.',
    clearSearch: 'Clear Search',
    viewMaterialList: 'View Material List',

    brandFieldLabel: 'Brand (Optional)',
    brandSearchPlaceholder: 'Search or type a brand name...',
    noBrandOption: 'No Brand',
    addCustomBrandBtn: 'Add Custom Brand',
    customBrandPlaceholder: 'Enter custom brand name',
    editBrandBtn: 'Edit Brand',
    saveBrandEditBtn: 'Save',
    brandHelperNote:
      'Brand suggestions are optional examples entered by you. No brand authorization or official partnership is implied.',
    selectedBrandLabel: 'Selected Brand',
    suggestedBrandsLabel: 'Suggestions',

    addMaterialTitle: 'Add Material to List',
    editMaterialTitle: 'Edit Material Entry',
    customMaterialTitle: 'Add Custom Material',
    materialNameLabel: 'Material Name',
    materialNamePlaceholder: 'Enter material name',
    categoryLabel: 'Category',
    customCategoryOption: '+ Add New Custom Category',
    customCategoryPlaceholder: 'Enter custom category name',
    sizeLabel: 'Size',
    sizePlaceholder: 'e.g., 2.5 sq.mm, 20mm, 12 Way',
    specificationLabel: 'Specification',
    specificationPlaceholder: 'e.g., FRLS Copper, SDR 11, Heavy Gauge',
    quantityLabel: 'Quantity',
    quantityModeManual: 'Manual Quantity',
    quantityModeEstimate: 'Automatic Estimate (Sq.Ft)',
    applyEstimateBtn: 'Use Estimate',
    estimateDisclaimer:
      'Automatic quantities are rough thumb-rule estimates based on square feet only—not engineering-certified requirements. Always verify and edit as needed.',
    estimateNeedSqFt: 'Enter Total Square Feet in Site Details (or below) to calculate an estimate.',
    unitLabel: 'Unit',
    priceLabel: 'Price (Optional)',
    priceOptionalHint: 'Unit price in INR (optional)',
    notesLabel: 'Notes (Optional)',
    notesPlaceholder: 'Colour, floor location, or shop instructions',
    addToListBtn: 'Add to Material List',
    saveChangesBtn: 'Save Changes',
    cancelBtn: 'Cancel',

    summaryTitle: 'Material List Summary',
    summarySubtitle: 'Review, edit quantities, filter by trade, and prepare your final PDF.',
    tabCombined: 'Combined List',
    tabElectrical: 'Electrical List',
    tabPlumbing: 'Plumbing List',
    colSNo: 'S.No',
    colMaterial: 'Material Name',
    colBrand: 'Brand',
    colSize: 'Size',
    colSpec: 'Specification',
    colQty: 'Quantity',
    colUnit: 'Unit',
    colPrice: 'Price',
    colAction: 'Action',
    editAction: 'Edit',
    deleteAction: 'Delete',
    addMoreMaterials: 'Add More Materials',
    clearListBtn: 'Clear List',
    confirmClearPrompt: 'Clear all items in this temporary list?',
    confirmYesClear: 'Yes, Clear All',
    totalItemsMetric: 'Total Line Items',
    estimatedAmountMetric: 'Estimated Total (Entered Prices)',
    emptyListTitle: 'Your Material List Is Empty',
    emptyListDesc: 'Start by selecting items from the Electrical or Plumbing catalogue, or add a custom material.',
    browseElectricalBtn: 'Browse Electrical Catalogue',
    browsePlumbingBtn: 'Browse Plumbing Catalogue',

    pdfTitle: 'Generate & Share A4 PDF',
    pdfSubtitle: 'Create a clean, shop-ready A4 PDF with your site header, categorized items, and signature block.',
    pdfScopeLabel: 'Select List to Export',
    scopeCombined: 'Combined (Electrical + Plumbing)',
    scopeElectrical: 'Electrical Only',
    scopePlumbing: 'Plumbing Only',
    includePriceLabel: 'Include Price & Total Column in PDF',
    listNotesLabel: 'General PDF Notes (Optional)',
    listNotesPlaceholder: 'Delivery schedule, site contact instructions, or brand preferences...',
    generatePdfBtn: 'Generate A4 PDF',
    generatingPdfLabel: 'Generating PDF...',
    pdfReadyNotice: 'Your A4 PDF has been generated in your browser and is ready for download or sharing.',
    downloadPdfBtn: 'Download PDF',
    sharePdfBtn: 'Share PDF',
    whatsappShareBtn: 'WhatsApp Share',
    printPdfBtn: 'Print PDF',
    createNewListBtn: 'Create New List',
    whatsappFallbackNotice:
      'PDF downloaded to your device. WhatsApp web/app has been opened with your summary message—please attach the downloaded PDF file manually before sending.',
    shareNotSupportedMsg:
      'Direct file sharing is not supported in this browser. The PDF has been downloaded so you can share or attach it manually.',
    shareConfirmedMsg: 'Share sheet opened by your browser.',
    pdfPreviewTitle: 'A4 Document Preview',
    pdfDocTitle: 'Electrical & Plumbing Material Requirement List',
    signaturePreparedBy: 'Prepared By (Signature)',
    signatureCustomer: 'Customer / Contractor (Signature)',
    confirmNewListPrompt: 'Start a fresh list? Current in-memory items and details will be cleared.',
    confirmNewListYes: 'Reset & Start New List',

    errPreparedBy: 'Please enter the Prepared By (Electrician or Plumber) name.',
    errMobile: 'Please enter a valid 10-digit mobile number.',
    errMaterialName: 'Please enter a material name.',
    errCategory: 'Please select or enter a category.',
    errQuantity: 'Quantity must be greater than 0.',
    errPrice: 'Price cannot be negative.',
  },
  ta: {
    brandName: 'SiteList Pro',
    tagline: 'மின்சாரம் & பிளம்பிங் பொருட்கள் பட்டியல் உருவாக்கி',
    brandMotto: 'SITELIST PRO – பொருட்களைத் தேர்வு செய். பிராண்ட் சேர். PDF உருவாக்கு. முடிந்தது.',
    navHome: 'முகப்பு',
    navElectrical: 'மின்சாரம்',
    navPlumbing: 'பிளம்பிங்',
    navList: 'பட்டியல்',
    navPdf: 'PDF உருவாக்கு',
    newListBtn: 'புதிய பட்டியல்',
    languageLabel: 'மொழி',
    tempNoticeTitle: 'தற்காலிக அமர்வு எச்சரிக்கை',
    tempNoticeDesc:
      'நீங்கள் உள்ளிடும் தகவல்கள் உலாவியில் தற்காலிகமாக மட்டுமே சேமிக்கப்படும். பக்கத்தை மூடினால் அல்லது ரெஃப்ரெஷ் செய்தால் தகவல்கள் அழிந்துவிடும்.',

    homeHeading: 'உங்கள் பொருட்கள் பட்டியலை உருவாக்குங்கள்',
    homeDescription:
      'மின்சாரம் மற்றும் பிளம்பிங் பொருட்களைத் தேர்ந்தெடுத்து, பிராண்ட் மற்றும் எண்ணிக்கையை உள்ளிட்டு கடைக்கான PDF உருவாக்குங்கள்.',
    electricalCardTitle: 'மின்சார பொருட்கள்',
    electricalCardDesc: 'வயர்கள், பைப்புகள், சுவிட்ச், பாக்ஸ்கள், MCB, விளக்குகள் மற்றும் எர்த்திங்.',
    plumbingCardTitle: 'பிளம்பிங் பொருட்கள்',
    plumbingCardDesc: 'PVC, CPVC, UPVC பைப்புகள், ஃபிட்டிங்ஸ், வால்வுகள், குளியலறை & டேங்க் பொருட்கள்.',
    createNewListAction: 'புதிய பட்டியல் தொடங்கு',
    currentSummaryAction: 'தற்போதைய பட்டியல்',
    generatePdfAction: 'PDF உருவாக்கு',
    siteDetailsAction: 'தளம் & பயனர் விவரம்',
    editSiteDetails: 'தள விவரம் திருத்து',
    itemsInList: 'பொருட்கள் பட்டியலில் உள்ளன',
    electricalItemsLabel: 'மின்சாரம்',
    plumbingItemsLabel: 'பிளம்பிங்',
    readyToExport: 'PDF எடுக்கத் தயார்',
    noItemsYet: 'இன்னும் பொருட்கள் சேர்க்கப்படவில்லை',
    startWorkflowTitle: 'விரைவு செயல்கள்',

    detailsTitle: 'தளம் மற்றும் தயாரிப்பாளர் விவரங்கள்',
    detailsSubtitle:
      'எலக்ட்ரீஷியன் / பிளம்பர் பெயர் மற்றும் தள விவரங்களை உள்ளிடவும். பெயர் மற்றும் மொபைல் எண் PDF-இல் இடம்பெறும்.',
    preparedBy: 'தயாரிப்பவர் பெயர் (எலக்ட்ரீஷியன் / பிளம்பர்)',
    preparedByPlaceholder: 'எ.கா: கார்த்திக்',
    mobileNumber: 'மொபைல் எண்',
    mobilePlaceholder: 'எ.கா: 9876543210',
    siteName: 'தளத்தின் பெயர் (Site Name)',
    siteNamePlaceholder: 'எ.கா: கிரீன் வேலி இல்லம்',
    customerName: 'வாடிக்கையாளர் பெயர்',
    customerNamePlaceholder: 'எ.கா: ரமேஷ் குமார்',
    customerMobile: 'வாடிக்கையாளர் மொபைல் எண்',
    customerMobilePlaceholder: 'எ.கா: 9840012345',
    siteAddress: 'தள முகவரி',
    siteAddressPlaceholder: 'தெரு, பகுதி, நகரம்',
    buildingType: 'கட்டிட வகை',
    totalSqFt: 'மொத்த சதுர அடி (Sq.Ft)',
    sqFtPlaceholder: 'எ.கா: 1200',
    numberOfFloors: 'தளங்களின் எண்ணிக்கை',
    floorsPlaceholder: 'எ.கா: 2',
    dateLabel: 'தேதி',
    saveAndElectrical: 'மின்சாரப் பட்டியலுக்குச் செல்',
    saveAndPlumbing: 'பிளம்பிங் பட்டியலுக்குச் செல்',
    saveDetailsOnly: 'விவரங்களைச் சேமி',
    detailsSavedMsg: 'தள விவரங்கள் இந்த அமர்வில் புதுப்பிக்கப்பட்டன.',
    requiredFieldsNote: '* குறியிட்ட விவரங்கள் PDF தலைப்பில் கட்டாயம் தேவை.',

    electricalCatalogTitle: 'மின்சாரப் பொருட்கள் பட்டியல்',
    electricalCatalogSub: 'பிரிவைத் தேர்ந்தெடுக்கவும் அல்லது பொருளின் பெயரைத் தேடவும்.',
    plumbingCatalogTitle: 'பிளம்பிங் பொருட்கள் பட்டியல்',
    plumbingCatalogSub: 'பிரிவைத் தேர்ந்தெடுக்கவும் அல்லது பொருளின் பெயரைத் தேடவும்.',
    searchMaterialsPlaceholder: 'பொருளின் பெயரைத் தேடுங்கள் (தமிழ் / English)...',
    addCustomMaterialBtn: '+ புதிய பொருள் சேர்',
    allCategories: 'அனைத்துப் பிரிவுகள்',
    categoriesHeading: 'பிரிவுகள்',
    materialsHeading: 'பொருட்கள்',
    selectMaterialBtn: 'தேர்வு செய்',
    itemsCountSuffix: 'பொருட்கள்',
    noSearchResults: 'பொருள் கிடைக்கவில்லை. "+ புதிய பொருள் சேர்" மூலம் நீங்களே சேர்க்கலாம்.',
    clearSearch: 'தேடலை அழி',
    viewMaterialList: 'பட்டியல் பார்',

    brandFieldLabel: 'பிராண்ட் (விருப்பமானால்)',
    brandSearchPlaceholder: 'பிராண்டைத் தேடவும் அல்லது தட்டச்சு செய்யவும்...',
    noBrandOption: 'பிராண்ட் இல்லை (No Brand)',
    addCustomBrandBtn: 'புதிய பிராண்ட் சேர்',
    customBrandPlaceholder: 'புதிய பிராண்ட் பெயர்',
    editBrandBtn: 'திருத்து',
    saveBrandEditBtn: 'சேமி',
    brandHelperNote:
      'பிராண்ட் பரிந்துரைகள் உதாரணத்திற்காக மட்டுமே. எந்த பிராண்ட் அங்கீகாரமும் இதில் இல்லை.',
    selectedBrandLabel: 'தேர்ந்தெடுத்த பிராண்ட்',
    suggestedBrandsLabel: 'பரிந்துரைகள்',

    addMaterialTitle: 'பட்டியலில் பொருள் சேர்',
    editMaterialTitle: 'பொருள் விவரம் திருத்து',
    customMaterialTitle: 'தனிப்பயன் பொருள் சேர்',
    materialNameLabel: 'பொருளின் பெயர்',
    materialNamePlaceholder: 'பொருளின் பெயரை உள்ளிடவும்',
    categoryLabel: 'பிரிவு',
    customCategoryOption: '+ புதிய பிரிவு சேர்',
    customCategoryPlaceholder: 'புதிய பிரிவு பெயர்',
    sizeLabel: 'அளவு (Size)',
    sizePlaceholder: 'எ.கா: 2.5 sq.mm, 20mm',
    specificationLabel: 'விவரக்குறிப்பு (Specification)',
    specificationPlaceholder: 'எ.கா: FRLS Copper, SDR 11',
    quantityLabel: 'எண்ணிக்கை / அளவு',
    quantityModeManual: 'நேரடி உள்ளீடு (Manual)',
    quantityModeEstimate: 'தானியங்கி மதிப்பீடு (Sq.Ft)',
    applyEstimateBtn: 'மதிப்பீட்டைப் பயன்படுத்து',
    estimateDisclaimer:
      'தானியங்கி எண்ணிக்கை சதுர அடியின் அடிப்படையிலான தோராய மதிப்பீடு மட்டுமே; பொறியியல் சான்றிதழ் அல்ல. தேவைக்கேற்ப திருத்தவும்.',
    estimateNeedSqFt: 'மதிப்பீட்டிற்கு தள விவரத்தில் சதுர அடியை உள்ளிடவும்.',
    unitLabel: 'அலகு (Unit)',
    priceLabel: 'விலை (விருப்பமானால்)',
    priceOptionalHint: 'ஒரு யூனிட் விலை ₹ (விருப்பம்)',
    notesLabel: 'குறிப்புகள் (விருப்பமானால்)',
    notesPlaceholder: 'நிறம், தளம் அல்லது கடைக்கான குறிப்பு',
    addToListBtn: 'பட்டியலில் சேர்',
    saveChangesBtn: 'மாற்றங்களைச் சேமி',
    cancelBtn: 'ரத்து செய்',

    summaryTitle: 'பொருட்கள் பட்டியல் சுருக்கம்',
    summarySubtitle: 'பொருட்கள், பிராண்ட், எண்ணிக்கையைச் சரிபார்த்து PDF உருவாக்கவும்.',
    tabCombined: 'இணைந்த பட்டியல்',
    tabElectrical: 'மின்சாரப் பட்டியல்',
    tabPlumbing: 'பிளம்பிங் பட்டியல்',
    colSNo: 'வ.எண்',
    colMaterial: 'பொருள் பெயர்',
    colBrand: 'பிராண்ட்',
    colSize: 'அளவு',
    colSpec: 'விவரம்',
    colQty: 'எண்ணிக்கை',
    colUnit: 'அலகு',
    colPrice: 'விலை',
    colAction: 'செயல்',
    editAction: 'திருத்து',
    deleteAction: 'நீக்கு',
    addMoreMaterials: 'மேலும் சேர்',
    clearListBtn: 'பட்டியல் அழி',
    confirmClearPrompt: 'இந்தப் பட்டியலில் உள்ள அனைத்துப் பொருட்களையும் அழிக்கவா?',
    confirmYesClear: 'ஆம், அழிக்கவும்',
    totalItemsMetric: 'மொத்த வரிசைகள்',
    estimatedAmountMetric: 'மதிப்பீட்டுத் தொகை (உள்ளிட்ட விலைகள்)',
    emptyListTitle: 'பொருட்கள் பட்டியல் காலியாக உள்ளது',
    emptyListDesc: 'மின்சாரம் அல்லது பிளம்பிங் பட்டியலிலிருந்து பொருட்களைத் தேர்ந்தெடுக்கவும்.',
    browseElectricalBtn: 'மின்சாரப் பட்டியல்',
    browsePlumbingBtn: 'பிளம்பிங் பட்டியல்',

    pdfTitle: 'A4 PDF உருவாக்கு & பகிர்',
    pdfSubtitle: 'தள விவரங்கள் மற்றும் கையொப்ப இடத்துடன் கூடிய A4 PDF உருவாக்கவும்.',
    pdfScopeLabel: 'PDF-இல் சேர்க்க வேண்டிய பட்டியல்',
    scopeCombined: 'இரண்டும் இணைந்தது (மின்சாரம் + பிளம்பிங்)',
    scopeElectrical: 'மின்சாரம் மட்டும்',
    scopePlumbing: 'பிளம்பிங் மட்டும்',
    includePriceLabel: 'PDF-இல் விலை & மொத்தத் தொகையைக் காட்டு',
    listNotesLabel: 'பொதுவான குறிப்புகள் (விருப்பமானால்)',
    listNotesPlaceholder: 'பொருட்கள் டெலிவரி அல்லது கூடுதல் தகவல்கள்...',
    generatePdfBtn: 'A4 PDF உருவாக்கு',
    generatingPdfLabel: 'PDF உருவாகிறது...',
    pdfReadyNotice: 'உங்கள் A4 PDF உலாவியில் உருவாக்கப்பட்டு பதிவிறக்கத் தயாராக உள்ளது.',
    downloadPdfBtn: 'PDF பதிவிறக்கு',
    sharePdfBtn: 'PDF பகிர்',
    whatsappShareBtn: 'WhatsApp பகிர்வு',
    printPdfBtn: 'PDF அச்சிடு',
    createNewListBtn: 'புதிய பட்டியல் உருவாக்கு',
    whatsappFallbackNotice:
      'PDF உங்கள் சாதனத்தில் பதிவிறக்கம் செய்யப்பட்டது. WhatsApp திறக்கப்பட்டுள்ளது—அனுப்பும் முன் பதிவிறக்கம் செய்யப்பட்ட PDF கோப்பை இணைக்கவும்.',
    shareNotSupportedMsg:
      'நேரடி கோப்புப் பகிர்வு இந்த உலாவியில் ஆதரிக்கப்படவில்லை. PDF பதிவிறக்கம் செய்யப்பட்டுள்ளது; நீங்கள் கைமுறையாகப் பகிரலாம்.',
    shareConfirmedMsg: 'உலாவியின் பகிர்வுப் பெட்டி திறக்கப்பட்டது.',
    pdfPreviewTitle: 'A4 ஆவண முன்னோட்டம்',
    pdfDocTitle: 'மின்சாரம் & பிளம்பிங் பொருட்கள் தேவைப் பட்டியல்',
    signaturePreparedBy: 'தயாரிப்பவர் கையொப்பம்',
    signatureCustomer: 'வாடிக்கையாளர் / ஒப்பந்ததாரர் கையொப்பம்',
    confirmNewListPrompt: 'புதிய பட்டியலைத் தொடங்கவா? தற்போதைய விவரங்கள் அனைத்தும் அழிக்கப்படும்.',
    confirmNewListYes: 'அழித்து புதியது தொடங்கு',

    errPreparedBy: 'தயாரிப்பவர் பெயரை உள்ளிடவும்.',
    errMobile: 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
    errMaterialName: 'பொருளின் பெயரை உள்ளிடவும்.',
    errCategory: 'பிரிவைத் தேர்ந்தெடுக்கவும் அல்லது உள்ளிடவும்.',
    errQuantity: 'எண்ணிக்கை 0-க்கு மேல் இருக்க வேண்டும்.',
    errPrice: 'விலை எதிர்மறையாக இருக்கக் கூடாது.',
  },
};
