"use client";

import type {
  AdminRole,
  AdminUser,
  AdminUserStatus,
  AuditEvent,
  Category,
  Customer,
  DiscountCode,
  Invitation,
  Order,
  OrderStatus,
  Product,
  ReturnRequest,
  Review,
  ScheduledReport,
} from "@/lib/admin-data";
import { AnalyticsSection } from "@/components/admin/sections/analytics-section";
import { AuditLogSection } from "@/components/admin/sections/audit-log-section";
import { CategoriesSection } from "@/components/admin/sections/categories-section";
import { CustomersSection } from "@/components/admin/sections/customers-section";
import { DashboardSection } from "@/components/admin/sections/dashboard-section";
import { DiscountsSection } from "@/components/admin/sections/discounts-section";
import { EmailTemplatesSection } from "@/components/admin/sections/email-templates-section";
import { OrdersSection } from "@/components/admin/sections/orders-section";
import { ProductsSection } from "@/components/admin/sections/products-section";
import { ReportsSection } from "@/components/admin/sections/reports-section";
import { ReturnsSection } from "@/components/admin/sections/returns-section";
import { ReviewsSection } from "@/components/admin/sections/reviews-section";
import { ApiKeysSection } from "@/components/admin/sections/api-keys-section";
import { BillingSection } from "@/components/admin/sections/billing-section";
import { ComplianceSection } from "@/components/admin/sections/compliance-section";
import { FeatureFlagsSection } from "@/components/admin/sections/feature-flags-section";
import { SettingsSection } from "@/components/admin/sections/settings-section";
import { WebhooksSection } from "@/components/admin/sections/webhooks-section";
import { UsersSection } from "@/components/admin/sections/users-section";
import type { InviteResult } from "@/components/admin/dashboard/use-admin-users";
import type { InvitationForm, Section } from "@/components/admin/shared/types";

type PaginatedView<T> = {
  items: T[];
  page: number;
  totalPages: number;
};

type DashboardMetrics = {
  activeProducts: number;
  lowStock: number;
  pendingOrders: number;
  revenue: number;
  currentRole: AdminRole;
  usersCount: number;
  invitationsCount: number;
};

type DashboardDatasets = {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  categories: Category[];
  discounts: DiscountCode[];
  returns: ReturnRequest[];
  reviews: Review[];
  auditEvents: AuditEvent[];
  scheduledReports: ScheduledReport[];
  invitations: Invitation[];
  users: AdminUser[];
};

type SharedFilters = {
  query: string;
  setQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  setPage: (page: number) => void;
};

type ProductSectionState = {
  page: PaginatedView<Product>;
  filteredCount: number;
};

type OrderSectionState = {
  page: PaginatedView<Order>;
  filteredCount: number;
};

type CustomerSectionState = {
  page: PaginatedView<Customer>;
  filteredCount: number;
};

type ProductActions = {
  bulkDelete: (ids: string[]) => void;
  bulkUpdateStatus: (ids: string[], status: Product["status"]) => void;
  remove: (productId: string) => void;
  openEdit: (product: Product) => void;
  openInventoryAdjustment: (productId: string) => void;
  openNew: () => void;
};

type CategoryActions = {
  remove: (categoryId: string) => void;
  openNew: () => void;
};

type DiscountActions = {
  openNew: () => void;
  remove: (id: string) => void;
};

type OrderActions = {
  bulkUpdateStatus: (ids: string[], status: OrderStatus) => void;
  openNew: () => void;
  openRefund: (orderId: string) => void;
  updateStatus: (orderId: string, status: OrderStatus) => void;
};

type ReturnControls = {
  query: string;
  setQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  approve: (id: string) => void;
  deny: (id: string) => void;
  refund: (id: string) => void;
};

type ReviewControls = {
  query: string;
  setQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  setStatus: (id: string, status: Review["status"]) => void;
};

type ReportActions = {
  openNew: () => void;
  toggle: (id: string) => void;
  run: (id: string) => void;
  remove: (id: string) => void;
};

type UserControls = {
  canManage: boolean;
  invitationForm: InvitationForm;
  invite: () => Promise<InviteResult>;
  removeInvitation: (id: string) => void;
  setInvitationForm: (form: InvitationForm) => void;
  updateRole: (userId: string, role: AdminRole) => void;
  updateStatus: (userId: string, status: AdminUserStatus) => void;
};

export function DashboardSectionRouter({
  section,
  switchSection,
  metrics,
  datasets,
  filters,
  productsView,
  productActions,
  categoryActions,
  discountActions,
  ordersView,
  orderActions,
  returnsControls,
  reviewsControls,
  customersView,
  reportActions,
  userControls,
}: {
  section: Section;
  switchSection: (section: Section) => void;
  metrics: DashboardMetrics;
  datasets: DashboardDatasets;
  filters: SharedFilters;
  productsView: ProductSectionState;
  productActions: ProductActions;
  categoryActions: CategoryActions;
  discountActions: DiscountActions;
  ordersView: OrderSectionState;
  orderActions: OrderActions;
  returnsControls: ReturnControls;
  reviewsControls: ReviewControls;
  customersView: CustomerSectionState;
  reportActions: ReportActions;
  userControls: UserControls;
}) {
  return (
    <>
      {section === "dashboard" ? (
        <DashboardSection
          activeProducts={metrics.activeProducts}
          lowStock={metrics.lowStock}
          orders={datasets.orders}
          pendingOrders={metrics.pendingOrders}
          products={datasets.products}
          revenue={metrics.revenue}
          currentRole={metrics.currentRole}
          usersCount={metrics.usersCount}
          invitationsCount={metrics.invitationsCount}
          setSection={switchSection}
        />
      ) : null}
      {section === "analytics" ? (
        <AnalyticsSection
          orders={datasets.orders}
          products={datasets.products}
          customers={datasets.customers}
        />
      ) : null}
      {section === "products" ? (
        <ProductsSection
          bulkDeleteProducts={productActions.bulkDelete}
          bulkUpdateProductStatus={productActions.bulkUpdateStatus}
          categories={datasets.categories}
          categoryFilter={filters.categoryFilter}
          deleteProduct={productActions.remove}
          openEditProduct={productActions.openEdit}
          openInventoryAdjustment={productActions.openInventoryAdjustment}
          openNewProduct={productActions.openNew}
          page={productsView.page.page}
          products={productsView.page.items}
          query={filters.query}
          setCategoryFilter={filters.setCategoryFilter}
          setPage={filters.setPage}
          setQuery={filters.setQuery}
          setStatusFilter={filters.setStatusFilter}
          statusFilter={filters.statusFilter}
          totalPages={productsView.page.totalPages}
          totalCount={productsView.filteredCount}
        />
      ) : null}
      {section === "categories" ? (
        <CategoriesSection
          categories={datasets.categories}
          deleteCategory={categoryActions.remove}
          openNewCategory={categoryActions.openNew}
        />
      ) : null}
      {section === "discounts" ? (
        <DiscountsSection
          discounts={datasets.discounts}
          openNewDiscount={discountActions.openNew}
          deleteDiscount={discountActions.remove}
        />
      ) : null}
      {section === "orders" ? (
        <OrdersSection
          bulkUpdateOrderStatus={orderActions.bulkUpdateStatus}
          openNewOrder={orderActions.openNew}
          openRefund={orderActions.openRefund}
          orders={ordersView.page.items}
          page={ordersView.page.page}
          query={filters.query}
          setPage={filters.setPage}
          setQuery={filters.setQuery}
          setStatusFilter={filters.setStatusFilter}
          statusFilter={filters.statusFilter}
          totalPages={ordersView.page.totalPages}
          totalCount={ordersView.filteredCount}
          updateOrderStatus={orderActions.updateStatus}
        />
      ) : null}
      {section === "returns" ? (
        <ReturnsSection
          returns={datasets.returns}
          query={returnsControls.query}
          setQuery={returnsControls.setQuery}
          statusFilter={returnsControls.statusFilter}
          setStatusFilter={returnsControls.setStatusFilter}
          onApprove={returnsControls.approve}
          onDeny={returnsControls.deny}
          onRefund={returnsControls.refund}
        />
      ) : null}
      {section === "reviews" ? (
        <ReviewsSection
          reviews={datasets.reviews}
          query={reviewsControls.query}
          setQuery={reviewsControls.setQuery}
          statusFilter={reviewsControls.statusFilter}
          setStatusFilter={reviewsControls.setStatusFilter}
          ratingFilter={reviewsControls.ratingFilter}
          setRatingFilter={reviewsControls.setRatingFilter}
          onApprove={(id) => reviewsControls.setStatus(id, "Approved")}
          onFlag={(id) => reviewsControls.setStatus(id, "Flagged")}
          onReject={(id) => reviewsControls.setStatus(id, "Rejected")}
        />
      ) : null}
      {section === "customers" ? (
        <CustomersSection
          customers={customersView.page.items}
          page={customersView.page.page}
          query={filters.query}
          setPage={filters.setPage}
          setQuery={filters.setQuery}
          totalPages={customersView.page.totalPages}
          totalCount={customersView.filteredCount}
        />
      ) : null}
      {section === "audit" ? (
        <AuditLogSection events={datasets.auditEvents} />
      ) : null}
      {section === "reports" ? (
        <ReportsSection
          reports={datasets.scheduledReports}
          openNewReport={reportActions.openNew}
          onToggle={reportActions.toggle}
          onRunNow={reportActions.run}
          onDelete={reportActions.remove}
        />
      ) : null}
      {section === "emails" ? (
        <EmailTemplatesSection
          customers={datasets.customers}
          orders={datasets.orders}
          products={datasets.products}
          storeName="StoreOps"
        />
      ) : null}
      {section === "flags" ? <FeatureFlagsSection /> : null}
      {section === "apikeys" ? <ApiKeysSection /> : null}
      {section === "webhooks" ? <WebhooksSection /> : null}
      {section === "billing" ? <BillingSection /> : null}
      {section === "compliance" ? <ComplianceSection /> : null}
      {section === "settings" ? <SettingsSection /> : null}
      {section === "users" ? (
        <UsersSection
          canManageUsers={userControls.canManage}
          currentRole={metrics.currentRole}
          invitationForm={userControls.invitationForm}
          invitations={datasets.invitations}
          inviteUser={userControls.invite}
          removeInvitation={userControls.removeInvitation}
          setInvitationForm={userControls.setInvitationForm}
          updateUserRole={userControls.updateRole}
          updateUserStatus={userControls.updateStatus}
          users={datasets.users}
        />
      ) : null}
    </>
  );
}
