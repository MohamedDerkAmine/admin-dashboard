"use client";

import { useState } from "react";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import Link from "next/link";

import type { GeneratedProductContent } from "@/types/product-ai";
import { AiProductContentAssistant } from "@/components/products/ai-product-content-assistant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductForm = {
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  category: string;
  tags: string;
  slug: string;
  seoTitle: string;
  seoMetaDescription: string;
};

const initialForm: ProductForm = {
  name: "",
  description: "",
  shortDescription: "",
  price: "",
  category: "",
  tags: "",
  slug: "",
  seoTitle: "",
  seoMetaDescription: "",
};

export function ProductCreateWorkspace() {
  const [form, setForm] = useState(initialForm);

  function applyGeneratedContent(content: GeneratedProductContent) {
    setForm((current) => ({
      ...current,
      name: current.name || content.productTitles[0] || "",
      shortDescription: content.shortDescription,
      description: content.longDescription,
      category: content.category,
      tags: content.tags.join(", "),
      slug: content.suggestedSlug,
      seoTitle: content.seoTitle,
      seoMetaDescription: content.seoMetaDescription,
    }));
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/products"
              className="-ml-2 mb-2 inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              Products
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">
              Create product
            </h1>
            <p className="text-sm text-muted-foreground">
              Draft product catalog content with AI, then refine it before
              saving.
            </p>
          </div>
          <Button type="button" variant="outline">
            <SaveIcon className="size-4" />
            Save draft
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border/60 px-4 py-3">
              <CardTitle className="text-sm">Product form</CardTitle>
              <p className="text-xs text-muted-foreground">
                This demo form is local state only; no database write is
                performed.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id="name"
                  label="Name"
                  value={form.name}
                  onChange={(value) => setForm({ ...form, name: value })}
                />
                <Field
                  id="price"
                  label="Price"
                  value={form.price}
                  onChange={(value) => setForm({ ...form, price: value })}
                />
                <Field
                  id="category"
                  label="Category"
                  value={form.category}
                  onChange={(value) => setForm({ ...form, category: value })}
                />
                <Field
                  id="slug"
                  label="Slug"
                  value={form.slug}
                  onChange={(value) => setForm({ ...form, slug: value })}
                />
              </div>
              <TextAreaField
                id="shortDescription"
                label="Short description"
                value={form.shortDescription}
                onChange={(value) =>
                  setForm({ ...form, shortDescription: value })
                }
              />
              <TextAreaField
                id="description"
                label="Description"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                minHeight="min-h-36"
              />
              <Field
                id="tags"
                label="Tags"
                value={form.tags}
                onChange={(value) => setForm({ ...form, tags: value })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id="seoTitle"
                  label="SEO title"
                  value={form.seoTitle}
                  onChange={(value) => setForm({ ...form, seoTitle: value })}
                />
                <TextAreaField
                  id="seoMetaDescription"
                  label="SEO meta description"
                  value={form.seoMetaDescription}
                  onChange={(value) =>
                    setForm({ ...form, seoMetaDescription: value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <AiProductContentAssistant onApply={applyGeneratedContent} />
        </div>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  onChange,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  minHeight = "min-h-24",
  onChange,
  value,
}: {
  id: string;
  label: string;
  minHeight?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <textarea
        id={id}
        className={`${minHeight} w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
