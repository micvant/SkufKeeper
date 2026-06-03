export interface StorageLocation {
  id: string;
  qrToken: string;
  name: string;
  description: string | null;
  photoPath: string | null;
  iconName: string | null;
  color: string | null;
  parentId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  customFields?: CustomFieldValue[];
  _count?: { items: number; children?: number };
  quantitySummary?: string | null;
  items?: Item[];
  children?: StorageLocation[];
  parent?: { id: string; name: string } | null;
}

export interface CustomFieldValue {
  id: string;
  definitionId: string;
  label: string;
  value: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  photoPath: string | null;
  iconName: string | null;
  quantity: number;
  unit: string;
  minQuantity?: number | null;
  expiresAt?: string | Date | null;
  locationId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  customFields?: CustomFieldValue[];
  location?: { id: string; name: string };
}

export interface ItemTreeNode {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface LocationTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  directItems: number;
  directItemQuantity: number;
  directQuantitySummary: string | null;
  childLocations: number;
  totalItems: number;
  totalItemQuantity: number;
  totalQuantitySummary: string | null;
  items: ItemTreeNode[];
  children: LocationTreeNode[];
}

export interface StatsResponse {
  totalLocations: number;
  totalItems: number;
  totalItemQuantity: number;
  totalQuantitySummary: string | null;
  rootLocations: number;
  tree: LocationTreeNode[];
}
