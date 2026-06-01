"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { initialCustomers } from "@/lib/admin-data";
import { createClient } from "@/lib/client";
import {
  sectionPaths,
  type AdminSearchState,
} from "@/components/admin/dashboard/routing";
import { navItems } from "@/components/admin/shared/constants";
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
import { useRecents, type RecentItem } from "@/components/admin/shared/recents";
import { Sidebar } from "@/components/admin/navigation/sidebar";
import { ToastProvider } from "@/components/admin/shared/toast";
import type { Section } from "@/components/admin/shared/types";

export function AdminDashboard({
  section,
  searchState,
  userEmail,
}: {
  section: Section;
  searchState: AdminSearchState;
  userEmail?: string;
}) {
  return (
    <ToastProvider>
      <AdminDashboardInner
        section={section}
        searchState={searchState}
        userEmail={userEmail}
      />
    </ToastProvider>
  );
}

function AdminDashboardInner({
  section,
  searchState,
  userEmail,
}: {
  section: Section;
  searchState: AdminSearchState;
  userEmail?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const recents = useRecents();
  const customers = initialCustomers;

  const sectionState = useSectionState({ section, searchState });
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
    initialQuery: section === "returns" ? searchState.query : "",
    initialStatusFilter:
      section === "returns" ? searchState.statusFilter : "All",
    setUrlQuery: section === "returns" ? sectionState.setQuery : undefined,
    setUrlStatusFilter:
      section === "returns" ? sectionState.setStatusFilter : undefined,
  });
  const reviews = useReviews({
    initialQuery: section === "reviews" ? searchState.query : "",
    initialStatusFilter:
      section === "reviews" ? searchState.statusFilter : "All",
    initialRatingFilter:
      section === "reviews" ? searchState.ratingFilter : "All",
    setUrlQuery: section === "reviews" ? sectionState.setQuery : undefined,
    setUrlStatusFilter:
      section === "reviews" ? sectionState.setStatusFilter : undefined,
    setUrlRatingFilter:
      section === "reviews" ? sectionState.setRatingFilter : undefined,
  });
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
      if (products.list.some((entry) => entry.id === item.id)) {
        router.push(`/products/${item.id}`);
      } else {
        recents.remove("product", item.id);
      }
      return;
    }
    if (item.type === "order") {
      if (orders.list.some((entry) => entry.id === item.id)) {
        router.push(`/orders/${item.id}`);
      } else {
        recents.remove("order", item.id);
      }
      return;
    }
    if (item.type === "category") {
      router.push(sectionPaths.categories);
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
            switchSection={sectionState.switchSection}
            metrics={{
              activeProducts: derived.activeProducts,
              lowStock: derived.lowStock,
              pendingOrders: derived.pendingOrders,
              revenue: derived.revenue,
              currentRole: adminUsers.currentRole,
              usersCount: adminUsers.users.length,
              invitationsCount: adminUsers.invitations.length,
            }}
            datasets={{
              products: products.list,
              orders: orders.list,
              customers,
              categories: categories.list,
              discounts: discounts.list,
              returns: returns.list,
              reviews: reviews.list,
              auditEvents: audit.events,
              scheduledReports: reports.list,
              invitations: adminUsers.invitations,
              users: adminUsers.users,
            }}
            filters={{
              query: sectionState.query,
              setQuery: sectionState.setQuery,
              statusFilter: sectionState.statusFilter,
              setStatusFilter: sectionState.setStatusFilter,
              categoryFilter: sectionState.categoryFilter,
              setCategoryFilter: sectionState.setCategoryFilter,
              setPage: sectionState.setPage,
            }}
            productsView={{
              page: derived.productPage,
              filteredCount: derived.filteredProducts.length,
            }}
            productActions={{
              bulkDelete: products.bulkDelete,
              bulkUpdateStatus: products.bulkUpdateStatus,
              remove: products.remove,
              openEdit: products.openEdit,
              openInventoryAdjustment: products.openInventoryAdjustment,
              openNew: products.openNew,
            }}
            categoryActions={{
              remove: categories.remove,
              openNew: categories.openNew,
            }}
            discountActions={{
              openNew: discounts.openNew,
              remove: discounts.remove,
            }}
            ordersView={{
              page: derived.orderPage,
              filteredCount: derived.filteredOrders.length,
            }}
            orderActions={{
              bulkUpdateStatus: orders.bulkUpdateStatus,
              openNew: orders.openNew,
              openRefund: orders.openRefund,
              updateStatus: orders.updateStatus,
            }}
            returnsControls={{
              query: returns.query,
              setQuery: returns.setQuery,
              statusFilter: returns.statusFilter,
              setStatusFilter: returns.setStatusFilter,
              approve: returns.approve,
              deny: returns.deny,
              refund: returns.refund,
            }}
            reviewsControls={{
              query: reviews.query,
              setQuery: reviews.setQuery,
              statusFilter: reviews.statusFilter,
              setStatusFilter: reviews.setStatusFilter,
              ratingFilter: reviews.ratingFilter,
              setRatingFilter: reviews.setRatingFilter,
              setStatus: reviews.setStatus,
            }}
            customersView={{
              page: derived.customerPage,
              filteredCount: derived.filteredCustomers.length,
            }}
            reportActions={{
              openNew: () => reports.setDialogOpen(true),
              toggle: reports.toggle,
              run: reports.run,
              remove: reports.remove,
            }}
            userControls={{
              canManage: adminUsers.canManageUsers,
              invitationForm: adminUsers.invitationForm,
              invite: adminUsers.inviteUser,
              removeInvitation: adminUsers.removeInvitation,
              setInvitationForm: adminUsers.setInvitationForm,
              updateRole: adminUsers.updateUserRole,
              updateStatus: adminUsers.updateUserStatus,
            }}
          />
        </main>
      </div>

      <DashboardDialogs
        productDialog={{
          open: products.dialogOpen,
          setOpen: products.setDialogOpen,
          editingProductId: products.editingId,
          form: products.form,
          setForm: products.setForm,
          save: products.save,
          categories: categories.list,
        }}
        categoryDialog={{
          open: categories.dialogOpen,
          setOpen: categories.setDialogOpen,
          form: categories.form,
          setForm: categories.setForm,
          save: categories.save,
        }}
        orderDialog={{
          open: orders.dialogOpen,
          setOpen: orders.setDialogOpen,
          form: orders.form,
          setForm: orders.setForm,
          save: orders.save,
        }}
        inventoryDialog={{
          product: inventoryProduct,
          setProductId: products.setInventoryProductId,
          applyAdjustment: products.applyInventoryAdjustment,
        }}
        refundDialog={{
          order: refundOrder,
          setOrderId: orders.setRefundOrderId,
          confirm: orders.confirmRefund,
        }}
        discountDialog={{
          open: discounts.dialogOpen,
          setOpen: discounts.setDialogOpen,
          save: discounts.save,
        }}
        reportDialog={{
          open: reports.dialogOpen,
          setOpen: reports.setDialogOpen,
          save: reports.save,
        }}
        commandPalette={{
          open: paletteOpen,
          setOpen: setPaletteOpen,
          switchSection: sectionState.switchSection,
          signOut,
          recents: recents.items,
          selectRecent: handleRecentSelect,
          showShortcuts: () => setShortcutsOpen(true),
        }}
        shortcutsDialog={{
          open: shortcutsOpen,
          setOpen: setShortcutsOpen,
        }}
      />
    </div>
  );
}
