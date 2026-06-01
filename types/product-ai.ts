export const brandTones = [
  "professional",
  "friendly",
  "luxury",
  "playful",
  "minimal",
  "bold",
] as const;

export type BrandTone = (typeof brandTones)[number];

export type ProductAiInput = {
  productName: string;
  productType: string;
  targetAudience?: string;
  keyFeatures: string;
  materialOrIngredients?: string;
  price?: string;
  brandTone?: BrandTone;
  existingDescription?: string;
};

export type GeneratedProductContent = {
  productTitles: string[];
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  seoTitle: string;
  seoMetaDescription: string;
  suggestedSlug: string;
  tags: string[];
  category: string;
  imageAltTexts: string[];
  marketingSummary: string;
};
