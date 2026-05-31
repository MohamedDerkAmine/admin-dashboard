"use client";

import type {
  Category,
  Order,
  Product,
} from "@/lib/admin-data";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { CommandPalette } from "@/components/admin/command-palette";
import {
  DiscountDialog,
  type DiscountFormState,
} from "@/components/admin/discount-dialog";
import {
  InventoryDialog,
  type InventoryAdjustmentReason,
} from "@/components/admin/inventory-dialog";
import { OrderDialog } from "@/components/admin/order-dialog";
import { ProductDialog } from "@/components/admin/product-dialog";
import type { RecentItem } from "@/components/admin/recents";
import { RefundDialog } from "@/components/admin/refund-dialog";
import {
  ReportDialog,
  type ReportFormState,
} from "@/components/admin/report-dialog";
import { ShortcutsDialog } from "@/components/admin/shortcuts-dialog";
import type {
  CategoryForm,
  OrderForm,
  ProductForm,
  Section,
} from "@/components/admin/types";

export function DashboardDialogs(props: {
  // product
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  editingProductId: string | null;
  productForm: ProductForm;
  setProductForm: (form: ProductForm) => void;
  saveProduct: () => void;
  categories: Category[];
  // category
  categoryDialogOpen: boolean;
  setCategoryDialogOpen: (open: boolean) => void;
  categoryForm: CategoryForm;
  setCategoryForm: (form: CategoryForm) => void;
  saveCategory: () => void;
  // order
  orderDialogOpen: boolean;
  setOrderDialogOpen: (open: boolean) => void;
  orderForm: OrderForm;
  setOrderForm: (form: OrderForm) => void;
  saveOrder: () => void;
  // inventory
  inventoryProduct: Product | null;
  setInventoryProductId: (id: string | null) => void;
  applyInventoryAdjustment: (
    productId: string,
    delta: number,
    reason: InventoryAdjustmentReason,
    note: string,
  ) => void;
  // refund
  refundOrder: Order | null;
  setRefundOrderId: (id: string | null) => void;
  confirmRefund: (amount: number, reason: string) => void;
  // discount
  discountDialogOpen: boolean;
  setDiscountDialogOpen: (open: boolean) => void;
  saveDiscount: (form: DiscountFormState) => void;
  // report
  reportDialogOpen: boolean;
  setReportDialogOpen: (open: boolean) => void;
  saveScheduledReport: (form: ReportFormState) => void;
  // command palette + shortcuts
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
  switchSection: (section: Section) => void;
  signOut: () => void;
  recents: RecentItem[];
  handleRecentSelect: (item: RecentItem) => void;
}) {
  const {
    productDialogOpen,
    setProductDialogOpen,
    editingProductId,
    productForm,
    setProductForm,
    saveProduct,
    categories,
    categoryDialogOpen,
    setCategoryDialogOpen,
    categoryForm,
    setCategoryForm,
    saveCategory,
    orderDialogOpen,
    setOrderDialogOpen,
    orderForm,
    setOrderForm,
    saveOrder,
    inventoryProduct,
    setInventoryProductId,
    applyInventoryAdjustment,
    refundOrder,
    setRefundOrderId,
    confirmRefund,
    discountDialogOpen,
    setDiscountDialogOpen,
    saveDiscount,
    reportDialogOpen,
    setReportDialogOpen,
    saveScheduledReport,
    paletteOpen,
    setPaletteOpen,
    shortcutsOpen,
    setShortcutsOpen,
    switchSection,
    signOut,
    recents,
    handleRecentSelect,
  } = props;

  return (
    <>
      <ProductDialog
        categories={categories}
        editingProductId={editingProductId}
        onOpenChange={setProductDialogOpen}
        onSave={saveProduct}
        open={productDialogOpen}
        productForm={productForm}
        setProductForm={setProductForm}
      />

      <CategoryDialog
        form={categoryForm}
        onOpenChange={setCategoryDialogOpen}
        onSave={saveCategory}
        open={categoryDialogOpen}
        setForm={setCategoryForm}
      />

      <OrderDialog
        form={orderForm}
        onOpenChange={setOrderDialogOpen}
        onSave={saveOrder}
        open={orderDialogOpen}
        setForm={setOrderForm}
      />

      <InventoryDialog
        product={inventoryProduct}
        open={inventoryProduct !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInventoryProductId(null);
          }
        }}
        onConfirm={applyInventoryAdjustment}
      />

      <RefundDialog
        order={refundOrder}
        open={refundOrder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRefundOrderId(null);
          }
        }}
        onConfirm={confirmRefund}
      />

      <DiscountDialog
        open={discountDialogOpen}
        onOpenChange={setDiscountDialogOpen}
        onSave={saveDiscount}
      />

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSave={saveScheduledReport}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        setSection={switchSection}
        onSignOut={signOut}
        onShowShortcuts={() => setShortcutsOpen(true)}
        recents={recents}
        onSelectRecent={handleRecentSelect}
      />

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
