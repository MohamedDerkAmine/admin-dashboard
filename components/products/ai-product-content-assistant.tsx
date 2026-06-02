"use client";

import { useState } from "react";
import { Loader2Icon, SparklesIcon, TriangleAlertIcon } from "lucide-react";

import {
  brandTones,
  type BrandTone,
  type GeneratedProductContent,
  type ProductAiInput,
} from "@/types/product-ai";
import { GeneratedProductContent as GeneratedProductContentView } from "@/components/products/generated-product-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AssistantForm = ProductAiInput;

const initialForm: AssistantForm = {
  productName: "",
  productType: "",
  targetAudience: "",
  keyFeatures: "",
  materialOrIngredients: "",
  price: "",
  brandTone: "professional",
  existingDescription: "",
};

export function AiProductContentAssistant({
  onApply,
}: {
  onApply?: (content: GeneratedProductContent) => void;
}) {
  const [form, setForm] = useState(initialForm);
  const [content, setContent] = useState<GeneratedProductContent | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/ai/product-content", {
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setError("Could not generate content. Please try again.");
      setIsLoading(false);
      return;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(
        typeof payload.error === "string"
          ? payload.error
          : "Could not generate content. Please try again.",
      );
      setIsLoading(false);
      return;
    }

    setContent(payload.data);
    setIsLoading(false);
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-border/60 px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SparklesIcon className="size-4" />
          </span>
          <div>
            <CardTitle className="text-sm">AI Product Content Assistant</CardTitle>
            <p className="text-xs text-muted-foreground">
              Turn basic product details into catalog, SEO, and marketing copy.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <Field
            id="productName"
            label="Product name"
            value={form.productName}
            onChange={(value) => setForm({ ...form, productName: value })}
            required
          />
          <Field
            id="productType"
            label="Product type"
            value={form.productType}
            onChange={(value) => setForm({ ...form, productType: value })}
            required
          />
          <Field
            id="targetAudience"
            label="Target audience"
            value={form.targetAudience ?? ""}
            onChange={(value) => setForm({ ...form, targetAudience: value })}
          />
          <TextAreaField
            id="keyFeatures"
            label="Key features"
            value={form.keyFeatures}
            onChange={(value) => setForm({ ...form, keyFeatures: value })}
            placeholder="40 hour battery, bluetooth 5.3, foldable design..."
            required
          />
          <Field
            id="materialOrIngredients"
            label="Material or ingredients"
            value={form.materialOrIngredients ?? ""}
            onChange={(value) =>
              setForm({ ...form, materialOrIngredients: value })
            }
          />
          <Field
            id="price"
            label="Price"
            value={form.price ?? ""}
            onChange={(value) => setForm({ ...form, price: value })}
          />
          <div className="grid gap-1.5">
            <Label htmlFor="brandTone" className="text-xs text-muted-foreground">
              Brand tone
            </Label>
            <Select
              value={form.brandTone}
              onValueChange={(value) =>
                setForm({ ...form, brandTone: value as BrandTone })
              }
            >
              <SelectTrigger id="brandTone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brandTones.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TextAreaField
            id="existingDescription"
            label="Existing description"
            value={form.existingDescription ?? ""}
            onChange={(value) =>
              setForm({ ...form, existingDescription: value })
            }
          />
          {error ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
          <Button className="w-full justify-center" disabled={isLoading}>
            {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : null}
            {isLoading ? "Generating product content..." : "Generate with AI"}
          </Button>
        </form>

        {!content && !isLoading ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Generated product content will appear here after you submit the
            form.
          </div>
        ) : null}
        {content ? (
          <GeneratedProductContentView content={content} onApply={onApply} />
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  onChange,
  required,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <textarea
        id={id}
        className="min-h-20 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
