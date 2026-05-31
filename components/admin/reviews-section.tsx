"use client";

import Link from "next/link";
import {
  CheckIcon,
  FlagIcon,
  MessageSquareIcon,
  StarIcon,
  XIcon,
} from "lucide-react";

import type { Review, ReviewStatus } from "@/lib/admin-data";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusDot, toneFor } from "@/components/admin/status-dot";
import { FilterSelect, Toolbar } from "@/components/admin/toolbar";
import { filterByQuery } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const reviewStatuses: ReviewStatus[] = [
  "Pending",
  "Approved",
  "Flagged",
  "Rejected",
];

const toneClass: Record<ReturnType<typeof toneFor>, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-destructive",
  info: "text-[var(--info)]",
  neutral: "text-muted-foreground",
};

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            "size-3.5",
            index < value
              ? "fill-[var(--warning)] text-[var(--warning)]"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewsSection({
  reviews,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  ratingFilter,
  setRatingFilter,
  onApprove,
  onFlag,
  onReject,
}: {
  reviews: Review[];
  query: string;
  setQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const filtered = filterByQuery(
    reviews,
    query,
    (entry) =>
      `${entry.productName} ${entry.customer} ${entry.email} ${entry.title} ${entry.body}`,
  )
    .filter(
      (entry) => statusFilter === "All" || entry.status === statusFilter,
    )
    .filter(
      (entry) =>
        ratingFilter === "All" || entry.rating === Number(ratingFilter),
    )
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  const summary = reviews.reduce(
    (acc, review) => {
      acc.total += 1;
      acc.sum += review.rating;
      acc.byStatus[review.status] = (acc.byStatus[review.status] ?? 0) + 1;
      return acc;
    },
    {
      total: 0,
      sum: 0,
      byStatus: {} as Record<ReviewStatus, number>,
    },
  );
  const avg = summary.total > 0 ? summary.sum / summary.total : 0;

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Reviews</h2>
          <p className="text-xs text-muted-foreground">
            {summary.total} review{summary.total === 1 ? "" : "s"} · avg{" "}
            {avg.toFixed(1)} ★ ·{" "}
            {summary.byStatus.Pending ?? 0} pending review
          </p>
        </div>
      </div>
      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search title, body, product, customer..."
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All", ...reviewStatuses]}
        />
        <FilterSelect
          label="Rating"
          value={ratingFilter}
          onChange={setRatingFilter}
          options={["All", "5", "4", "3", "2", "1"]}
        />
      </Toolbar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareIcon}
          title="No reviews to moderate"
          description="Try a different filter or wait for new submissions."
        />
      ) : (
        <ol className="divide-y divide-border/40">
          {filtered.map((review) => {
            const tone = toneFor(review.status);
            return (
              <li key={review.id} className="grid gap-2 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Rating value={review.rating} />
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          toneClass[tone],
                        )}
                      >
                        <StatusDot status={review.status} showLabel={false} />
                        {review.status}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formatRelativeTime(review.submittedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-snug">
                      {review.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                      {review.body}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      <Link
                        href={`/products/${review.productId}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {review.productName}
                      </Link>{" "}
                      · {review.customer} · {review.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {review.status !== "Approved" ? (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onApprove(review.id)}
                      >
                        <CheckIcon className="size-3.5" />
                        Approve
                      </Button>
                    ) : null}
                    {review.status !== "Flagged" ? (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onFlag(review.id)}
                      >
                        <FlagIcon className="size-3.5" />
                        Flag
                      </Button>
                    ) : null}
                    {review.status !== "Rejected" ? (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onReject(review.id)}
                      >
                        <XIcon className="size-3.5" />
                        Reject
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
