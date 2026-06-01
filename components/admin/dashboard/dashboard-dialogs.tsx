"use client";

import type {
  Category,
  Order,
  Product,
} from "@/lib/admin-data";
import { CategoryDialog } from "@/components/admin/dialogs/category-dialog";
import { CommandPalette } from "@/components/admin/dialogs/command-palette";
import {
  DiscountDialog,
  type DiscountFormState,
} from "@/components/admin/dialogs/discount-dialog";
import {
  InventoryDialog,
  type InventoryAdjustmentReason,
} from "@/components/admin/dialogs/inventory-dialog";
import { OrderDialog } from "@/components/admin/dialogs/order-dialog";
import { ProductDialog } from "@/components/admin/dialogs/product-dialog";
import type { RecentItem } from "@/components/admin/shared/recents";
import { RefundDialog } from "@/components/admin/dialogs/refund-dialog";
import {
  ReportDialog,
  type ReportFormState,
} from "@/components/admin/dialogs/report-dialog";
import { ShortcutsDialog } from "@/components/admin/dialogs/shortcuts-dialog";
import type {
  CategoryForm,
  OrderForm,
  ProductForm,
  Section,
} from "@/components/admin/shared/types";

type ProductDialogControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingProductId: string | null;
  form: ProductForm;
  setForm: (form: ProductForm) => void;
  save: () => void;
  categories: Category[];
};

type CategoryDialogControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
  form: CategoryForm;
  setForm: (form: CategoryForm) => void;
  save: () => void;
};

type OrderDialogControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
  form: OrderForm;
  setForm: (form: OrderForm) => void;
  save: () => void;
};

type InventoryDialogControls = {
  product: Product | null;
  setProductId: (id: string | null) => void;
  applyAdjustment: (
    productId: string,
    delta: number,
    reason: InventoryAdjustmentReason,
    note: string,
  ) => void;
};

type RefundDialogControls = {
  order: Order | null;
  setOrderId: (id: string | null) => void;
  confirm: (amount: number, reason: string) => void;
};

type DiscountDialogControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
  save: (form: DiscountFormState) => void;
};

type ReportDialogControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
  save: (form: ReportFormState) => void;
};

type CommandPaletteControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
  switchSection: (section: Section) => void;
  signOut: () => void;
  recents: RecentItem[];
  selectRecent: (item: RecentItem) => void;
  showShortcuts: () => void;
};

type ShortcutsDialogControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function DashboardDialogs({
  productDialog,
  categoryDialog,
  orderDialog,
  inventoryDialog,
  refundDialog,
  discountDialog,
  reportDialog,
  commandPalette,
  shortcutsDialog,
}: {
  productDialog: ProductDialogControls;
  categoryDialog: CategoryDialogControls;
  orderDialog: OrderDialogControls;
  inventoryDialog: InventoryDialogControls;
  refundDialog: RefundDialogControls;
  discountDialog: DiscountDialogControls;
  reportDialog: ReportDialogControls;
  commandPalette: CommandPaletteControls;
  shortcutsDialog: ShortcutsDialogControls;
}) {

  return (
    <>
      <ProductDialog
        categories={productDialog.categories}
        editingProductId={productDialog.editingProductId}
        onOpenChange={productDialog.setOpen}
        onSave={productDialog.save}
        open={productDialog.open}
        productForm={productDialog.form}
        setProductForm={productDialog.setForm}
      />

      <CategoryDialog
        form={categoryDialog.form}
        onOpenChange={categoryDialog.setOpen}
        onSave={categoryDialog.save}
        open={categoryDialog.open}
        setForm={categoryDialog.setForm}
      />

      <OrderDialog
        form={orderDialog.form}
        onOpenChange={orderDialog.setOpen}
        onSave={orderDialog.save}
        open={orderDialog.open}
        setForm={orderDialog.setForm}
      />

      <InventoryDialog
        product={inventoryDialog.product}
        open={inventoryDialog.product !== null}
        onOpenChange={(open) => {
          if (!open) {
            inventoryDialog.setProductId(null);
          }
        }}
        onConfirm={inventoryDialog.applyAdjustment}
      />

      <RefundDialog
        order={refundDialog.order}
        open={refundDialog.order !== null}
        onOpenChange={(open) => {
          if (!open) {
            refundDialog.setOrderId(null);
          }
        }}
        onConfirm={refundDialog.confirm}
      />

      <DiscountDialog
        open={discountDialog.open}
        onOpenChange={discountDialog.setOpen}
        onSave={discountDialog.save}
      />

      <ReportDialog
        open={reportDialog.open}
        onOpenChange={reportDialog.setOpen}
        onSave={reportDialog.save}
      />

      <CommandPalette
        open={commandPalette.open}
        onOpenChange={commandPalette.setOpen}
        setSection={commandPalette.switchSection}
        onSignOut={commandPalette.signOut}
        onShowShortcuts={commandPalette.showShortcuts}
        recents={commandPalette.recents}
        onSelectRecent={commandPalette.selectRecent}
      />

      <ShortcutsDialog
        open={shortcutsDialog.open}
        onOpenChange={shortcutsDialog.setOpen}
      />
    </>
  );
}
