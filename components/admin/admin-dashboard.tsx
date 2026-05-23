"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRightIcon, LogOutIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  initialCategories,
  initialAdminUsers,
  initialCustomers,
  initialInvitations,
  initialOrders,
  initialProducts,
  type AdminRole,
  type AdminUserStatus,
  type OrderStatus,
  type Product,
} from "@/lib/admin-data";
import { createClient } from "@/lib/client";
import { CategoriesSection } from "@/components/admin/categories-section";
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
import { filterByQuery, paginate } from "@/components/admin/utils";
import { MobileNav } from "@/components/admin/mobile-nav";
import { OrdersSection } from "@/components/admin/orders-section";
import { ProductDialog } from "@/components/admin/product-dialog";
import { ProductsSection } from "@/components/admin/products-section";
import { Sidebar } from "@/components/admin/sidebar";
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
  const router = useRouter();
  const supabase = createClient();
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
  const [paletteOpen, setPaletteOpen] = useState(false);
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
    } else {
      setProducts((current) => [
        {
          id: `prd-${Date.now()}`,
          ...productForm,
        },
        ...current,
      ]);
    }

    setProductDialogOpen(false);
  }

  function deleteProduct(productId: string) {
    setProducts((current) =>
      current.filter((product) => product.id !== productId),
    );
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

    setCategories((current) => [
      ...current,
      { id: `cat-${Date.now()}`, name, productCount: 0 },
    ]);
    setCategoryForm(emptyCategoryForm);
    setCategoryDialogOpen(false);
  }

  function deleteCategory(categoryId: string) {
    setCategories((current) =>
      current.filter((category) => category.id !== categoryId),
    );
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

    setOrders((current) => [
      {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: today,
        ...orderForm,
      },
      ...current,
    ]);
    setOrderForm(emptyOrderForm);
    setOrderDialogOpen(false);
  }

  function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
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
          {section === "orders" ? (
            <OrdersSection
              openNewOrder={openNewOrder}
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

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        setSection={switchSection}
        onSignOut={signOut}
      />
    </div>
  );
}
