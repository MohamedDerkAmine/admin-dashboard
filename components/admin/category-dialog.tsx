import { TagsIcon } from "lucide-react";

import type { CategoryForm } from "@/components/admin/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryDialog({
  form,
  onOpenChange,
  onSave,
  open,
  setForm,
}: {
  form: CategoryForm;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  open: boolean;
  setForm: (form: CategoryForm) => void;
}) {
  const canSave = form.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagsIcon className="size-4 text-muted-foreground" />
            Create category
          </DialogTitle>
          <DialogDescription>
            Categories group products in the catalog. New categories start with
            zero products.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="category-name" className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id="category-name"
            autoFocus
            placeholder="e.g. Accessories"
            value={form.name}
            onChange={(event) => setForm({ name: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSave) {
                event.preventDefault();
                onSave();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
            Create category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
