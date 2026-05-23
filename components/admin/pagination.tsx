import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { pageSize } from "@/components/admin/constants";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  totalCount,
  setPage,
}: {
  page: number;
  totalPages: number;
  totalCount?: number;
  setPage: (page: number) => void;
}) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = totalCount !== undefined
    ? Math.min(page * pageSize, totalCount)
    : page * pageSize;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/40 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-mono tabular-nums">
        {totalCount !== undefined ? (
          <>
            {start}–{end} of {totalCount}
          </>
        ) : (
          <>
            Page {page} of {totalPages}
          </>
        )}
      </span>
      <div className="flex items-center gap-1">
        <span className="hidden font-mono tabular-nums sm:inline">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="size-7"
        >
          <ChevronLeftIcon className="size-3.5" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="size-7"
        >
          <ChevronRightIcon className="size-3.5" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
}
