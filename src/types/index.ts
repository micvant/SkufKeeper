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
  _count?: { items: number; children?: number };
  items?: Item[];
  children?: StorageLocation[];
  parent?: { id: string; name: string } | null;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  photoPath: string | null;
  iconName: string | null;
  quantity: number;
  unit: string;
  locationId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
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
  childLocations: number;
  totalItems: number;
  totalItemQuantity: number;
  items: ItemTreeNode[];
  children: LocationTreeNode[];
}

export interface StatsResponse {
  totalLocations: number;
  totalItems: number;
  totalItemQuantity: number;
  rootLocations: number;
  tree: LocationTreeNode[];
}
