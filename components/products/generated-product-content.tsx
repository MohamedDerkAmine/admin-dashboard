"use client";

import { useState } from "react";
import { CheckIcon, ClipboardIcon } from "lucide-react";

import type { GeneratedProductContent } from "@/types/product-ai";
import { Button } from "@/components/ui/button";

export function GeneratedProductContent({
  content,
  onApply,
}: {
  content: GeneratedProductContent;
  onApply?: (content: GeneratedProductContent) => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copy(value: string, key: string) {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1600);
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Generated content</h3>
          <p className="text-xs text-muted-foreground">
            Review, copy, or apply this content to the product form.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton
            copied={copiedKey === "json"}
            label="Copy JSON"
            onClick={() => copy(JSON.stringify(content, null, 2), "json")}
          />
          {onApply ? (
            <Button size="sm" onClick={() => onApply(content)}>
              Apply
            </Button>
          ) : null}
        </div>
      </div>

      <Section title="Product title suggestions">
        <ul className="grid gap-1.5">
          {content.productTitles.map((title) => (
            <li
              key={title}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm"
            >
              {title}
            </li>
          ))}
        </ul>
      </Section>

      <TextSection
        title="Short description"
        value={content.shortDescription}
        copied={copiedKey === "shortDescription"}
        onCopy={() => copy(content.shortDescription, "shortDescription")}
      />
      <TextSection
        title="Long description"
        value={content.longDescription}
        copied={copiedKey === "longDescription"}
        onCopy={() => copy(content.longDescription, "longDescription")}
      />
      <Section title="Bullet points">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {content.bulletPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </Section>
      <TextSection
        title="SEO title"
        value={content.seoTitle}
        copied={copiedKey === "seoTitle"}
        onCopy={() => copy(content.seoTitle, "seoTitle")}
      />
      <TextSection
        title="SEO meta description"
        value={content.seoMetaDescription}
        copied={copiedKey === "seoMetaDescription"}
        onCopy={() => copy(content.seoMetaDescription, "seoMetaDescription")}
      />
      <TextSection
        title="Suggested slug"
        value={content.suggestedSlug}
        copied={copiedKey === "slug"}
        onCopy={() => copy(content.suggestedSlug, "slug")}
      />
      <Section title="Tags">
        <div className="flex flex-wrap gap-1.5">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </Section>
      <TextSection
        title="Category"
        value={content.category}
        copied={copiedKey === "category"}
        onCopy={() => copy(content.category, "category")}
      />
      <Section title="Image alt text suggestions">
        <ul className="grid gap-1.5">
          {content.imageAltTexts.map((alt) => (
            <li
              key={alt}
              className="rounded-md border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground"
            >
              {alt}
            </li>
          ))}
        </ul>
      </Section>
      <TextSection
        title="Marketing summary"
        value={content.marketingSummary}
        copied={copiedKey === "marketingSummary"}
        onCopy={() => copy(content.marketingSummary, "marketingSummary")}
      />
    </div>
  );
}

function TextSection({
  copied,
  onCopy,
  title,
  value,
}: {
  copied: boolean;
  onCopy: () => void;
  title: string;
  value: string;
}) {
  return (
    <Section
      title={title}
      action={<CopyButton copied={copied} label="Copy" onClick={onCopy} />}
    >
      <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
        {value}
      </p>
    </Section>
  );
}

function Section({
  action,
  children,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
          {title}
        </h4>
        {action}
      </div>
      {children}
    </section>
  );
}

function CopyButton({
  copied,
  label,
  onClick,
}: {
  copied: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button size="xs" variant="outline" onClick={onClick}>
      {copied ? <CheckIcon className="size-3" /> : <ClipboardIcon className="size-3" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
