export interface StorageLocation {
  id: string;
  qrToken: string;
  name: string;
  description: string | null;
  photoPath: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: { items: number };
  items?: Item[];
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  photoPath: string | null;
  quantity: number;
  locationId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  location?: { id: string; name: string };
}
