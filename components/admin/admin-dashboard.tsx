"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { initialCustomers } from "@/lib/admin-data";
import { createClient } from "@/lib/client";
import { navItems } from "@/components/admin/constants";
import { DashboardDialogs } from "@/components/admin/dashboard/dashboard-dialogs";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { DashboardSectionRouter } from "@/components/admin/dashboard/dashboard-section-router";
import { useAdminUsers } from "@/components/admin/dashboard/use-admin-users";
import { useAuditLog } from "@/components/admin/dashboard/use-audit-log";
import { useCategories } from "@/components/admin/dashboard/use-categories";
import { useDashboardDerived } from "@/components/admin/dashboard/use-dashboard-derived";
import { useDiscounts } from "@/components/admin/dashboard/use-discounts";
import { useGlobalHotkeys } from "@/components/admin/dashboard/use-global-hotkeys";
import { useOrders } from "@/components/admin/dashboard/use-orders";
import { useProducts } from "@/components/admin/dashboard/use-products";
import { useReturns } from "@/components/admin/dashboard/use-returns";
import { useReviews } from "@/components/admin/dashboard/use-reviews";
import { useScheduledReports } from "@/components/admin/dashboard/use-scheduled-reports";
import { useSectionState } from "@/components/admin/dashboard/use-section-state";
import { useRecents, type RecentItem } from "@/components/admin/recents";
import { Sidebar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/admin/toast";

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
  const recents = useRecents();
  const customers = initialCustomers;

  const sectionState = useSectionState();
  const audit = useAuditLog(userEmail);
  const categories = useCategories({ recents, logAudit: audit.log });
  const products = useProducts({
    categories: categories.list,
    recents,
    logAudit: audit.log,
  });
  const orders = useOrders({ recents, logAudit: audit.log });
  const discounts = useDiscounts({ logAudit: audit.log });
  const returns = useReturns({
    orders: orders.list,
    markOrderRefunded: orders.markRefunded,
    logAudit: audit.log,
  });
  const reviews = useReviews();
  const reports = useScheduledReports({
    datasets: {
      products: products.list,
      orders: orders.list,
      customers,
      returns: returns.list,
      reviews: reviews.list,
    },
    logAudit: audit.log,
  });
  const adminUsers = useAdminUsers({ userEmail });

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const derived = useDashboardDerived({
    products: products.list,
    orders: orders.list,
    customers,
    query: sectionState.query,
    statusFilter: sectionState.statusFilter,
    categoryFilter: sectionState.categoryFilter,
    page: sectionState.page,
  });

  useGlobalHotkeys({
    paletteOpen,
    setPaletteOpen,
    setShortcutsOpen,
    switchSection: sectionState.switchSection,
  });

  function handleRecentSelect(item: RecentItem) {
    setPaletteOpen(false);
    if (item.type === "product") {
      const product = products.list.find((entry) => entry.id === item.id);
      if (product) {
        sectionState.switchSection("products");
        products.openEdit(product);
      } else {
        recents.remove("product", item.id);
      }
      return;
    }
    if (item.type === "order") {
      sectionState.switchSection("orders");
      return;
    }
    if (item.type === "category") {
      sectionState.switchSection("categories");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  }

  const sectionLabel = navItems.find(
    (item) => item.id === sectionState.section,
  )?.label;

  const inventoryProduct =
    products.list.find((product) => product.id === products.inventoryProductId) ??
    null;
  const refundOrder =
    orders.list.find((order) => order.id === orders.refundOrderId) ?? null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        section={sectionState.section}
        setCollapsed={setSidebarCollapsed}
        setSection={sectionState.switchSection}
        userEmail={userEmail}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          section={sectionState.section}
          sectionLabel={sectionLabel}
          switchSection={sectionState.switchSection}
          products={products.list}
          orders={orders.list}
          returns={returns.list}
          setPaletteOpen={setPaletteOpen}
          signOut={signOut}
        />

        <main className="grid min-w-0 gap-4 p-3 md:p-4">
          <DashboardSectionRouter
            section={sectionState.section}
            activeProducts={derived.activeProducts}
            lowStock={derived.lowStock}
            pendingOrders={derived.pendingOrders}
            revenue={derived.revenue}
            currentRole={adminUsers.currentRole}
            usersCount={adminUsers.users.length}
            invitationsCount={adminUsers.invitations.length}
            switchSection={sectionState.switchSection}
            products={products.list}
            orders={orders.list}
            customers={customers}
            query={sectionState.query}
            setQuery={sectionState.setQuery}
            statusFilter={sectionState.statusFilter}
            setStatusFilter={sectionState.setStatusFilter}
            categoryFilter={sectionState.categoryFilter}
            setCategoryFilter={sectionState.setCategoryFilter}
            page={sectionState.page}
            setPage={sectionState.setPage}
            productPage={derived.productPage}
            filteredProductsCount={derived.filteredProducts.length}
            categories={categories.list}
            bulkDeleteProducts={products.bulkDelete}
            bulkUpdateProductStatus={products.bulkUpdateStatus}
            deleteProduct={products.remove}
            openEditProduct={products.openEdit}
            openInventoryAdjustment={products.openInventoryAdjustment}
            openNewProduct={products.openNew}
            deleteCategory={categories.remove}
            openNewCategory={categories.openNew}
            discounts={discounts.list}
            openNewDiscount={discounts.openNew}
            deleteDiscount={discounts.remove}
            orderPage={derived.orderPage}
            filteredOrdersCount={derived.filteredOrders.length}
            bulkUpdateOrderStatus={orders.bulkUpdateStatus}
            openNewOrder={orders.openNew}
            openRefund={orders.openRefund}
            updateOrderStatus={orders.updateStatus}
            returns={returns.list}
            returnsQuery={returns.query}
            setReturnsQuery={returns.setQuery}
            returnsStatusFilter={returns.statusFilter}
            setReturnsStatusFilter={returns.setStatusFilter}
            approveReturn={returns.approve}
            denyReturn={returns.deny}
            refundReturn={returns.refund}
            reviews={reviews.list}
            reviewsQuery={reviews.query}
            setReviewsQuery={reviews.setQuery}
            reviewsStatusFilter={reviews.statusFilter}
            setReviewsStatusFilter={reviews.setStatusFilter}
            reviewsRatingFilter={reviews.ratingFilter}
            setReviewsRatingFilter={reviews.setRatingFilter}
            setReviewStatus={reviews.setStatus}
            customerPage={derived.customerPage}
            filteredCustomersCount={derived.filteredCustomers.length}
            auditEvents={audit.events}
            scheduledReports={reports.list}
            openNewReport={() => reports.setDialogOpen(true)}
            toggleScheduledReport={reports.toggle}
            runScheduledReport={reports.run}
            deleteScheduledReport={reports.remove}
            canManageUsers={adminUsers.canManageUsers}
            invitationForm={adminUsers.invitationForm}
            invitations={adminUsers.invitations}
            inviteUser={adminUsers.inviteUser}
            removeInvitation={adminUsers.removeInvitation}
            setInvitationForm={adminUsers.setInvitationForm}
            updateUserRole={adminUsers.updateUserRole}
            updateUserStatus={adminUsers.updateUserStatus}
            users={adminUsers.users}
          />
        </main>
      </div>

      <DashboardDialogs
        productDialogOpen={products.dialogOpen}
        setProductDialogOpen={products.setDialogOpen}
        editingProductId={products.editingId}
        productForm={products.form}
        setProductForm={products.setForm}
        saveProduct={products.save}
        categories={categories.list}
        categoryDialogOpen={categories.dialogOpen}
        setCategoryDialogOpen={categories.setDialogOpen}
        categoryForm={categories.form}
        setCategoryForm={categories.setForm}
        saveCategory={categories.save}
        orderDialogOpen={orders.dialogOpen}
        setOrderDialogOpen={orders.setDialogOpen}
        orderForm={orders.form}
        setOrderForm={orders.setForm}
        saveOrder={orders.save}
        inventoryProduct={inventoryProduct}
        setInventoryProductId={products.setInventoryProductId}
        applyInventoryAdjustment={products.applyInventoryAdjustment}
        refundOrder={refundOrder}
        setRefundOrderId={orders.setRefundOrderId}
        confirmRefund={orders.confirmRefund}
        discountDialogOpen={discounts.dialogOpen}
        setDiscountDialogOpen={discounts.setDialogOpen}
        saveDiscount={discounts.save}
        reportDialogOpen={reports.dialogOpen}
        setReportDialogOpen={reports.setDialogOpen}
        saveScheduledReport={reports.save}
        paletteOpen={paletteOpen}
        setPaletteOpen={setPaletteOpen}
        shortcutsOpen={shortcutsOpen}
        setShortcutsOpen={setShortcutsOpen}
        switchSection={sectionState.switchSection}
        signOut={signOut}
        recents={recents.items}
        handleRecentSelect={handleRecentSelect}
      />
    </div>
  );
}
