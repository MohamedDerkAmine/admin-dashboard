import {
  brandTones,
  type BrandTone,
  type GeneratedProductContent,
  type ProductAiInput,
} from "@/types/product-ai";

export class ProductAiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductAiValidationError";
  }
}

export function validateProductAiInput(input: unknown): ProductAiInput {
  if (!isRecord(input)) {
    throw new ProductAiValidationError("Request body must be an object.");
  }

  const productName = requiredString(input.productName, {
    label: "Product name",
    max: 120,
    min: 2,
  });
  const productType = requiredString(input.productType, {
    label: "Product type",
    max: 80,
    min: 2,
  });
  const keyFeatures = requiredString(input.keyFeatures, {
    label: "Key features",
    max: 1000,
    min: 5,
  });
  const brandTone = optionalBrandTone(input.brandTone);

  return withoutEmptyValues({
    productName,
    productType,
    keyFeatures,
    brandTone,
    existingDescription: optionalString(input.existingDescription, {
      label: "Existing description",
      max: 1500,
    }),
    materialOrIngredients: optionalString(input.materialOrIngredients, {
      label: "Material or ingredients",
      max: 300,
    }),
    price: optionalString(input.price, { label: "Price", max: 50 }),
    targetAudience: optionalString(input.targetAudience, {
      label: "Target audience",
      max: 200,
    }),
  });
}

export function validateGeneratedProductContent(
  input: unknown,
): GeneratedProductContent {
  if (!isRecord(input)) {
    throw new ProductAiValidationError("AI returned an invalid format.");
  }

  return {
    productTitles: stringArray(input.productTitles, "productTitles", 1, 5),
    shortDescription: requiredOutputString(
      input.shortDescription,
      "shortDescription",
    ),
    longDescription: requiredOutputString(input.longDescription, "longDescription"),
    bulletPoints: stringArray(input.bulletPoints, "bulletPoints", 1, 8),
    seoTitle: requiredOutputString(input.seoTitle, "seoTitle"),
    seoMetaDescription: requiredOutputString(
      input.seoMetaDescription,
      "seoMetaDescription",
    ),
    suggestedSlug: requiredOutputString(input.suggestedSlug, "suggestedSlug"),
    tags: stringArray(input.tags, "tags", 1, 12),
    category: requiredOutputString(input.category, "category"),
    imageAltTexts: stringArray(input.imageAltTexts, "imageAltTexts", 1, 6),
    marketingSummary: requiredOutputString(
      input.marketingSummary,
      "marketingSummary",
    ),
  };
}

function requiredString(
  value: unknown,
  {
    label,
    max,
    min,
  }: {
    label: string;
    max: number;
    min: number;
  },
) {
  if (typeof value !== "string") {
    throw new ProductAiValidationError(`${label} is required.`);
  }

  const normalized = value.trim();

  if (normalized.length < min) {
    throw new ProductAiValidationError(
      `${label} must be at least ${min} characters.`,
    );
  }

  if (normalized.length > max) {
    throw new ProductAiValidationError(
      `${label} must be ${max} characters or fewer.`,
    );
  }

  return normalized;
}

function optionalString(
  value: unknown,
  { label, max }: { label: string; max: number },
) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ProductAiValidationError(`${label} must be text.`);
  }

  const normalized = value.trim();

  if (normalized.length > max) {
    throw new ProductAiValidationError(
      `${label} must be ${max} characters or fewer.`,
    );
  }

  return normalized || undefined;
}

function optionalBrandTone(value: unknown): BrandTone | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (
    typeof value !== "string" ||
    !brandTones.includes(value as BrandTone)
  ) {
    throw new ProductAiValidationError(
      `Brand tone must be one of: ${brandTones.join(", ")}.`,
    );
  }

  return value as BrandTone;
}

function stringArray(
  value: unknown,
  field: keyof GeneratedProductContent,
  min: number,
  max: number,
) {
  if (!Array.isArray(value)) {
    throw new ProductAiValidationError(`AI field ${field} must be an array.`);
  }

  const normalized = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (normalized.length < min || normalized.length > max) {
    throw new ProductAiValidationError(`AI field ${field} has invalid length.`);
  }

  return normalized;
}

function requiredOutputString(value: unknown, field: keyof GeneratedProductContent) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ProductAiValidationError(`AI field ${field} must be text.`);
  }

  return value.trim();
}

function withoutEmptyValues(input: ProductAiInput): ProductAiInput {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as ProductAiInput;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
