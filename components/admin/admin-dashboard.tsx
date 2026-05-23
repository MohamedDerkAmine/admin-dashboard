"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRightIcon, LogOutIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  initialAuditEvents,
  initialCategories,
  initialAdminUsers,
  initialCustomers,
  initialDiscountCodes,
  initialInvitations,
  initialOrders,
  initialProducts,
  type AdminRole,
  type AdminUserStatus,
  type AuditAction,
  type AuditEvent,
  type AuditResource,
  type DiscountCode,
  type OrderStatus,
  type Product,
} from "@/lib/admin-data";
import { createClient } from "@/lib/client";
import { AuditLogSection } from "@/components/admin/audit-log-section";
import { CategoriesSection } from "@/components/admin/categories-section";
import {
  DiscountDialog,
  type DiscountFormState,
} from "@/components/admin/discount-dialog";
import { DiscountsSection } from "@/components/admin/discounts-section";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { CommandPalette } from "@/components/admin/command-palette";
import { CustomersSection } from "@/components/admin/customers-section";
import { DashboardSection } from "@/components/admin/dashboard-section";
import {
  emptyCategoryForm,
  emptyInvitationForm,
  emptyOrderForm,
  emptyProductForm,
  navItems,
} from "@/components/admin/constants";
import { OrderDialog } from "@/components/admin/order-dialog";
import { Kbd } from "@/components/admin/kbd";
import { RefundDialog } from "@/components/admin/refund-dialog";
import { useRecents, type RecentItem } from "@/components/admin/recents";
import { filterByQuery, paginate } from "@/components/admin/utils";
import { MobileNav } from "@/components/admin/mobile-nav";
import { OrdersSection } from "@/components/admin/orders-section";
import { ProductDialog } from "@/components/admin/product-dialog";
import { ProductsSection } from "@/components/admin/products-section";
import { DensityToggle } from "@/components/admin/density-toggle";
import { ShortcutsDialog } from "@/components/admin/shortcuts-dialog";
import { Sidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { UsersSection } from "@/components/admin/users-section";
import type {
  CategoryForm,
  InvitationForm,
  OrderForm,
  ProductForm,
  Section,
} from "@/components/admin/types";
import { Button } from "@/components/ui/button";

export function AdminDashboard({ userEmail }: { userEmail?: string }) {
  return (
    <ToastProvider>
      <AdminDashboardInner userEmail={userEmail} />
    </ToastProvider>
  );
}

function AdminDashboardInner({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const recents = useRecents();
  const [section, setSection] = useState<Section>("dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [orders, setOrders] = useState(initialOrders);
  const [customers] = useState(initialCustomers);
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [currentRole] = useState<AdminRole>("Owner");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [invitationForm, setInvitationForm] =
    useState<InvitationForm>(emptyInvitationForm);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>(emptyOrderForm);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [discounts, setDiscounts] =
    useState<DiscountCode[]>(initialDiscountCodes);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [auditEvents, setAuditEvents] =
    useState<AuditEvent[]>(initialAuditEvents);
  const canManageUsers = currentRole === "Owner" || currentRole === "Admin";

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeProducts = products.filter(
    (product) => product.status === "Active",
  ).length;
  const lowStock = products.filter((product) => product.stock <= 10).length;
  const pendingOrders = orders.filter(
    (order) => order.status === "Pending",
  ).length;

  const filteredProducts = useMemo(() => {
    const bySearch = filterByQuery(
      products,
      query,
      (product) =>
        `${product.name} ${product.sku} ${product.category} ${product.status}`,
    );

    return bySearch.filter((product) => {
      const matchesStatus =
        statusFilter === "All" || product.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }, [products, query, statusFilter, categoryFilter]);

  const filteredOrders = useMemo(() => {
    const bySearch = filterByQuery(
      orders,
      query,
      (order) => `${order.id} ${order.customer} ${order.email} ${order.status}`,
    );

    return bySearch.filter(
      (order) => statusFilter === "All" || order.status === statusFilter,
    );
  }, [orders, query, statusFilter]);

  const filteredCustomers = useMemo(
    () =>
      filterByQuery(
        customers,
        query,
        (customer) => `${customer.name} ${customer.email} ${customer.segment}`,
      ),
    [customers, query],
  );

  const productPage = paginate(filteredProducts, page);
  const orderPage = paginate(filteredOrders, page);
  const customerPage = paginate(filteredCustomers, page);

  function logAudit(
    action: AuditAction,
    resource: AuditResource,
    target: string,
    detail?: string,
  ) {
    const event: AuditEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      actor: userEmail ?? "current user",
      action,
      resource,
      target,
      detail,
    };
    setAuditEvents((current) => [event, ...current]);
  }

  function switchSection(nextSection: Section) {
    setSection(nextSection);
    setQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setPage(1);
  }

  function openNewProduct() {
    setEditingProductId(null);
    setProductForm({
      ...emptyProductForm,
      category: categories[0]?.name ?? "Uncategorized",
    });
    setProductDialogOpen(true);
  }

  function openEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
    });
    setProductDialogOpen(true);
    recents.push({ type: "product", id: product.id, label: product.name });
  }

  function handleRecentSelect(item: RecentItem) {
    setPaletteOpen(false);
    if (item.type === "product") {
      const product = products.find((entry) => entry.id === item.id);
      if (product) {
        switchSection("products");
        openEditProduct(product);
      } else {
        recents.remove("product", item.id);
      }
      return;
    }
    if (item.type === "order") {
      switchSection("orders");
      return;
    }
    if (item.type === "category") {
      switchSection("categories");
    }
  }

  function saveProduct() {
    if (!productForm.name.trim() || !productForm.sku.trim()) {
      return;
    }

    if (editingProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId
            ? { ...product, ...productForm }
            : product,
        ),
      );
      logAudit("updated", "product", productForm.name);
    } else {
      const created = {
        id: `prd-${Date.now()}`,
        ...productForm,
      };
      setProducts((current) => [created, ...current]);
      logAudit("created", "product", productForm.name);
    }

    setProductDialogOpen(false);
  }

  function bulkDeleteProducts(ids: string[]) {
    if (ids.length === 0) {
      return;
    }
    const removed = products.filter((product) => ids.includes(product.id));
    setProducts((current) =>
      current.filter((product) => !ids.includes(product.id)),
    );
    logAudit(
      "deleted",
      "product",
      `${removed.length} product${removed.length === 1 ? "" : "s"}`,
    );
    toast({
      title: `Deleted ${removed.length} product${removed.length === 1 ? "" : "s"}`,
      tone: "destructive",
      action: {
        label: "Undo",
        onClick: () => {
          setProducts((current) => [...removed, ...current]);
        },
      },
    });
  }

  function bulkUpdateProductStatus(ids: string[], status: Product["status"]) {
    if (ids.length === 0) {
      return;
    }
    setProducts((current) =>
      current.map((product) =>
        ids.includes(product.id) ? { ...product, status } : product,
      ),
    );
    logAudit(
      "status_changed",
      "product",
      `${ids.length} product${ids.length === 1 ? "" : "s"}`,
      `→ ${status}`,
    );
    toast({
      title: `Set ${ids.length} product${ids.length === 1 ? "" : "s"} to ${status}`,
    });
  }

  function bulkUpdateOrderStatus(ids: string[], status: OrderStatus) {
    if (ids.length === 0) {
      return;
    }
    setOrders((current) =>
      current.map((order) =>
        ids.includes(order.id) ? { ...order, status } : order,
      ),
    );
    logAudit(
      "status_changed",
      "order",
      `${ids.length} order${ids.length === 1 ? "" : "s"}`,
      `→ ${status}`,
    );
    toast({
      title: `Set ${ids.length} order${ids.length === 1 ? "" : "s"} to ${status}`,
    });
  }

  function deleteProduct(productId: string) {
    const removed = products.find((product) => product.id === productId);
    const index = products.findIndex((product) => product.id === productId);
    setProducts((current) =>
      current.filter((product) => product.id !== productId),
    );
    if (removed) {
      logAudit("deleted", "product", removed.name);
      toast({
        title: `Deleted "${removed.name}"`,
        description: "Product removed from the catalog.",
        tone: "destructive",
        action: {
          label: "Undo",
          onClick: () => {
            setProducts((current) => {
              const next = [...current];
              next.splice(Math.min(index, next.length), 0, removed);
              return next;
            });
          },
        },
      });
    }
  }

  function openNewCategory() {
    setCategoryForm(emptyCategoryForm);
    setCategoryDialogOpen(true);
  }

  function saveCategory() {
    const name = categoryForm.name.trim();

    if (!name) {
      return;
    }

    const newCategory = { id: `cat-${Date.now()}`, name, productCount: 0 };
    setCategories((current) => [...current, newCategory]);
    setCategoryForm(emptyCategoryForm);
    setCategoryDialogOpen(false);
    logAudit("created", "category", name);
    recents.push({
      type: "category",
      id: newCategory.id,
      label: newCategory.name,
    });
  }

  function deleteCategory(categoryId: string) {
    const removed = categories.find((category) => category.id === categoryId);
    const index = categories.findIndex(
      (category) => category.id === categoryId,
    );
    setCategories((current) =>
      current.filter((category) => category.id !== categoryId),
    );
    if (removed) {
      logAudit("deleted", "category", removed.name);
      toast({
        title: `Deleted "${removed.name}"`,
        tone: "destructive",
        action: {
          label: "Undo",
          onClick: () => {
            setCategories((current) => {
              const next = [...current];
              next.splice(Math.min(index, next.length), 0, removed);
              return next;
            });
          },
        },
      });
    }
  }

  function openNewOrder() {
    setOrderForm(emptyOrderForm);
    setOrderDialogOpen(true);
  }

  function saveOrder() {
    if (!orderForm.customer.trim() || !orderForm.email.trim()) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
      ...orderForm,
    };
    setOrders((current) => [newOrder, ...current]);
    setOrderForm(emptyOrderForm);
    setOrderDialogOpen(false);
    logAudit("created", "order", newOrder.id, `${newOrder.customer}`);
    recents.push({
      type: "order",
      id: newOrder.id,
      label: `${newOrder.id} · ${newOrder.customer}`,
    });
  }

  function openNewDiscount() {
    setDiscountDialogOpen(true);
  }

  function saveDiscount(form: DiscountFormState) {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      return;
    }
    const newDiscount: DiscountCode = {
      id: `disc-${Date.now()}`,
      code,
      kind: form.kind,
      value: form.value,
      status: form.status,
      expiresAt: form.expiresAt || undefined,
      maxUses: form.maxUses > 0 ? form.maxUses : undefined,
      usedCount: 0,
    };
    setDiscounts((current) => [newDiscount, ...current]);
    setDiscountDialogOpen(false);
    logAudit(
      "created",
      "discount",
      code,
      form.kind === "percent" ? `${form.value}% off` : `$${form.value} off`,
    );
    toast({ title: `Created code ${code}` });
  }

  function deleteDiscount(id: string) {
    const removed = discounts.find((entry) => entry.id === id);
    setDiscounts((current) => current.filter((entry) => entry.id !== id));
    if (removed) {
      logAudit("deleted", "discount", removed.code);
      toast({
        title: `Deleted code ${removed.code}`,
        tone: "destructive",
        action: {
          label: "Undo",
          onClick: () => setDiscounts((current) => [removed, ...current]),
        },
      });
    }
  }

  function openRefund(orderId: string) {
    setRefundOrderId(orderId);
  }

  function confirmRefund(amount: number, reason: string) {
    if (!refundOrderId) {
      return;
    }
    const target = orders.find((order) => order.id === refundOrderId);
    if (!target) {
      return;
    }
    const isPartial = amount < target.total;
    setOrders((current) =>
      current.map((order) =>
        order.id === refundOrderId ? { ...order, status: "Refunded" } : order,
      ),
    );
    const detail = `$${amount.toFixed(2)}${isPartial ? " (partial)" : ""}${reason ? ` · ${reason}` : ""}`;
    logAudit("status_changed", "order", target.id, `Refunded · ${detail}`);
    toast({
      title: `Refunded ${target.id}`,
      description: detail,
    });
    setRefundOrderId(null);
  }

  function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
    logAudit("status_changed", "order", orderId, `→ ${status}`);
  }

  function updateUserRole(userId: string, role: AdminRole) {
    if (!canManageUsers || role === "Owner") {
      return;
    }

    setAdminUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, role } : user)),
    );
  }

  function updateUserStatus(userId: string, status: AdminUserStatus) {
    if (!canManageUsers) {
      return;
    }

    setAdminUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
  }

  function inviteUser() {
    const email = invitationForm.email.trim();

    if (!canManageUsers || !email) {
      return;
    }

    setInvitations((current) => [
      {
        id: `INV-${Date.now()}`,
        email,
        role: invitationForm.role,
        invitedBy: userEmail ?? "Current user",
        expires: "7 days",
      },
      ...current,
    ]);
    setInvitationForm(emptyInvitationForm);
  }

  function removeInvitation(invitationId: string) {
    if (!canManageUsers) {
      return;
    }

    setInvitations((current) =>
      current.filter((invitation) => invitation.id !== invitationId),
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
        return;
      }

      if (!isTyping && !paletteOpen) {
        if (event.key === "?" || (event.shiftKey && event.key === "/")) {
          event.preventDefault();
          setShortcutsOpen((current) => !current);
          return;
        }

        const numberKey = Number(event.key);

        if (Number.isInteger(numberKey) && numberKey >= 1 && numberKey <= navItems.length) {
          event.preventDefault();
          switchSection(navItems[numberKey - 1].id);
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paletteOpen]);

  const sectionLabel = navItems.find((item) => item.id === section)?.label;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        section={section}
        setCollapsed={setSidebarCollapsed}
        setSection={switchSection}
        userEmail={userEmail}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md md:px-4">
          <MobileNav section={section} setSection={switchSection} />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">StoreOps</span>
            <ChevronRightIcon className="size-3 text-muted-foreground/60" />
            <span className="truncate font-medium">{sectionLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden h-8 items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex md:w-72"
          >
            <SearchIcon className="size-3.5" />
            <span className="flex-1 text-left">Search or jump to...</span>
            <Kbd>⌘K</Kbd>
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setPaletteOpen(true)}
          >
            <SearchIcon className="size-4" />
            <span className="sr-only">Open search</span>
          </Button>

          <div className="h-5 w-px bg-border" aria-hidden />

          <DensityToggle />
          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOutIcon className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </header>

        <main className="grid min-w-0 gap-4 p-3 md:p-4">
          {section === "dashboard" ? (
            <DashboardSection
              activeProducts={activeProducts}
              lowStock={lowStock}
              orders={orders}
              pendingOrders={pendingOrders}
              products={products}
              revenue={revenue}
              currentRole={currentRole}
              usersCount={adminUsers.length}
              invitationsCount={invitations.length}
              setSection={switchSection}
            />
          ) : null}
          {section === "products" ? (
            <ProductsSection
              bulkDeleteProducts={bulkDeleteProducts}
              bulkUpdateProductStatus={bulkUpdateProductStatus}
              categories={categories}
              categoryFilter={categoryFilter}
              deleteProduct={deleteProduct}
              openEditProduct={openEditProduct}
              openNewProduct={openNewProduct}
              page={productPage.page}
              products={productPage.items}
              query={query}
              setCategoryFilter={setCategoryFilter}
              setPage={setPage}
              setQuery={setQuery}
              setStatusFilter={setStatusFilter}
              statusFilter={statusFilter}
              totalPages={productPage.totalPages}
              totalCount={filteredProducts.length}
            />
          ) : null}
          {section === "categories" ? (
            <CategoriesSection
              categories={categories}
              deleteCategory={deleteCategory}
              openNewCategory={openNewCategory}
            />
          ) : null}
          {section === "discounts" ? (
            <DiscountsSection
              discounts={discounts}
              openNewDiscount={openNewDiscount}
              deleteDiscount={deleteDiscount}
            />
          ) : null}
          {section === "orders" ? (
            <OrdersSection
              bulkUpdateOrderStatus={bulkUpdateOrderStatus}
              openNewOrder={openNewOrder}
              openRefund={openRefund}
              orders={orderPage.items}
              page={orderPage.page}
              query={query}
              setPage={setPage}
              setQuery={setQuery}
              setStatusFilter={setStatusFilter}
              statusFilter={statusFilter}
              totalPages={orderPage.totalPages}
              totalCount={filteredOrders.length}
              updateOrderStatus={updateOrderStatus}
            />
          ) : null}
          {section === "customers" ? (
            <CustomersSection
              customers={customerPage.items}
              page={customerPage.page}
              query={query}
              setPage={setPage}
              setQuery={setQuery}
              totalPages={customerPage.totalPages}
              totalCount={filteredCustomers.length}
            />
          ) : null}
          {section === "audit" ? <AuditLogSection events={auditEvents} /> : null}
          {section === "users" ? (
            <UsersSection
              canManageUsers={canManageUsers}
              currentRole={currentRole}
              invitationForm={invitationForm}
              invitations={invitations}
              inviteUser={inviteUser}
              removeInvitation={removeInvitation}
              setInvitationForm={setInvitationForm}
              updateUserRole={updateUserRole}
              updateUserStatus={updateUserStatus}
              users={adminUsers}
            />
          ) : null}
        </main>
      </div>

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

      <RefundDialog
        order={orders.find((order) => order.id === refundOrderId) ?? null}
        open={refundOrderId !== null}
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

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        setSection={switchSection}
        onSignOut={signOut}
        onShowShortcuts={() => setShortcutsOpen(true)}
        recents={recents.items}
        onSelectRecent={handleRecentSelect}
      />

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
