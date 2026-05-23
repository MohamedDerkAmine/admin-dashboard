import { ImagePlusIcon, PackageIcon } from "lucide-react";

import type { Category, Product } from "@/lib/admin-data";
import type { ProductForm } from "@/components/admin/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productStatuses: Product["status"][] = ["Active", "Draft", "Archived"];

export function ProductDialog({
  categories,
  editingProductId,
  onOpenChange,
  onSave,
  open,
  productForm,
  setProductForm,
}: {
  categories: Category[];
  editingProductId: string | null;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  open: boolean;
  productForm: ProductForm;
  setProductForm: (form: ProductForm) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editingProductId ? "Edit product" : "Create product"}
          </DialogTitle>
          <DialogDescription>
            Catalog details, stock, status, and an optional image preview.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-[88px] items-center justify-center overflow-hidden rounded-md border border-border/70 bg-muted text-muted-foreground">
              {productForm.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={productForm.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <PackageIcon className="size-6" />
              )}
            </div>
            <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ImagePlusIcon className="size-3.5" />
              Upload
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  setProductForm({
                    ...productForm,
                    imageUrl: URL.createObjectURL(file),
                  });
                }}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <Input
                value={productForm.name}
                onChange={(event) =>
                  setProductForm({ ...productForm, name: event.target.value })
                }
              />
            </Field>
            <Field label="SKU">
              <Input
                className="font-mono text-xs"
                value={productForm.sku}
                onChange={(event) =>
                  setProductForm({ ...productForm, sku: event.target.value })
                }
              />
            </Field>
            <Field label="Category">
              <Select
                value={productForm.category}
                onValueChange={(value) =>
                  setProductForm({ ...productForm, category: value as string })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={productForm.status}
                onValueChange={(value) =>
                  setProductForm({
                    ...productForm,
                    status: value as Product["status"],
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Price">
              <Input
                min={0}
                type="number"
                className="font-mono tabular-nums"
                value={productForm.price}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    price: Number(event.target.value),
                  })
                }
              />
            </Field>
            <Field label="Stock">
              <Input
                min={0}
                type="number"
                className="font-mono tabular-nums"
                value={productForm.stock}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    stock: Number(event.target.value),
                  })
                }
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingProductId ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
