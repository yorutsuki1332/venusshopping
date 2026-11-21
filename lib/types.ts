export type ProductStatus = "pending" | "published";

export type Tier = {
  min: number;
  label: string;
  price: number;
};

export type ProductSource = {
  channel: "whatsapp" | "seed";
  sender: string;
  text: string;
  receivedAt: string;
};

export type Product = {
  id: string;
  status: ProductStatus;
  brand: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  quote: string;
  cutoff: string;
  arrival: string;
  unit: string;
  origPrice: number;
  tiers: Tier[];
  specs: string[];
  images: string[];
  joined: number;
  source: ProductSource;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type OrderItem = {
  productId: string;
  title: string;
  spec: string;
  qty: number;
  unitPrice: number;
  image: string;
};

export type Order = {
  id: string;
  name: string;
  phone: string;
  contact: string;
  note: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

export type ShopSettings = {
  brand: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  tags: string[];
  campaignEndsAt: string;
  giftThreshold: number;
  giftLabel: string;
};

export type Database = {
  settings: ShopSettings;
  products: Product[];
  orders: Order[];
};

export type ParsedDraft = {
  brand: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  quote: string;
  cutoff: string;
  arrival: string;
  unit: string;
  origPrice: number;
  tiers: Tier[];
  specs: string[];
  raw: string;
};
