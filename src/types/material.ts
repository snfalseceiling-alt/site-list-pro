export type Language = 'en' | 'ta';

export type TradeType = 'electrical' | 'plumbing';

export type UnitType =
  | 'Nos'
  | 'Meter'
  | 'Feet'
  | 'Roll'
  | 'Box'
  | 'Set'
  | 'Packet'
  | 'Kg'
  | 'Litre'
  | 'Piece';

export type BuildingType =
  | 'Residential House'
  | 'Apartment / Flat'
  | 'Commercial Shop / Office'
  | 'Villa / Duplex'
  | 'Industrial / Shed';

export type AppScreen =
  | 'home'
  | 'details'
  | 'electrical'
  | 'plumbing'
  | 'list'
  | 'pdf';

export type ListScope = 'combined' | 'electrical' | 'plumbing';

export interface SiteDetails {
  preparedBy: string;
  mobileNumber: string;
  siteName: string;
  customerName: string;
  customerMobile: string;
  siteAddress: string;
  buildingType: BuildingType;
  totalSqFt: string;
  numberOfFloors: string;
  date: string;
}

export interface EstimateRule {
  qtyPer1000SqFt: number;
  minQty: number;
  unit: UnitType;
  noteEn: string;
  noteTa: string;
}

export interface CatalogItem {
  id: string;
  nameEn: string;
  nameTa: string;
  defaultUnit: UnitType;
  defaultSize?: string;
  defaultSpec?: string;
  estimateRule?: EstimateRule;
}

export interface CatalogCategory {
  id: string;
  trade: TradeType;
  nameEn: string;
  nameTa: string;
  items: CatalogItem[];
}

export interface MaterialEntry {
  id: string;
  trade: TradeType;
  categoryId: string;
  categoryName: string;
  materialName: string;
  brand: string; // empty string or 'No Brand' when none selected
  size: string;
  specification: string;
  quantity: number;
  unit: UnitType;
  price?: number;
  notes?: string;
  isCustom: boolean;
}

export interface CustomCategory {
  id: string;
  trade: TradeType;
  name: string;
}

export interface ValidationErrors {
  [field: string]: string;
}
