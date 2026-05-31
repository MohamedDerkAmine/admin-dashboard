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
import { AnalyticsSection } from "@/components/admin/analytics-section";
import { AuditLogSection } from "@/components/admin/audit-log-section";
import { CategoriesSection } from "@/components/admin/categories-section";
import { CustomersSection } from "@/components/admin/customers-section";
import { DashboardSection } from "@/components/admin/dashboard-section";
import { DiscountsSection } from "@/components/admin/discounts-section";
import { EmailTemplatesSection } from "@/components/admin/email-templates-section";
import { OrdersSection } from "@/components/admin/orders-section";
import { ProductsSection } from "@/components/admin/products-section";
import { ReportsSection } from "@/components/admin/reports-section";
import { ReturnsSection } from "@/components/admin/returns-section";
import { ReviewsSection } from "@/components/admin/reviews-section";
import { SettingsSection } from "@/components/admin/settings-section";
import { UsersSection } from "@/components/admin/users-section";
import type { InvitationForm, Section } from "@/components/admin/types";

type PaginatedView<T> = {
  items: T[];
  page: number;
  totalPages: number;
};

export function DashboardSectionRouter(props: {
  section: Section;
  // dashboard
  activeProducts: number;
  lowStock: number;
  pendingOrders: number;
  revenue: number;
  currentRole: AdminRole;
  usersCount: number;
  invitationsCount: number;
  switchSection: (section: Section) => void;
  // shared lists
  products: Product[];
  orders: Order[];
  customers: Customer[];
  // filter state
  query: string;
  setQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  page: number;
  setPage: (page: number) => void;
  // analytics
  // products
  productPage: PaginatedView<Product>;
  filteredProductsCount: number;
  categories: Category[];
  bulkDeleteProducts: (ids: string[]) => void;
  bulkUpdateProductStatus: (ids: string[], status: Product["status"]) => void;
  deleteProduct: (productId: string) => void;
  openEditProduct: (product: Product) => void;
  openInventoryAdjustment: (productId: string) => void;
  openNewProduct: () => void;
  // categories
  deleteCategory: (categoryId: string) => void;
  openNewCategory: () => void;
  // discounts
  discounts: DiscountCode[];
  openNewDiscount: () => void;
  deleteDiscount: (id: string) => void;
  // orders
  orderPage: PaginatedView<Order>;
  filteredOrdersCount: number;
  bulkUpdateOrderStatus: (ids: string[], status: OrderStatus) => void;
  openNewOrder: () => void;
  openRefund: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  // returns
  returns: ReturnRequest[];
  returnsQuery: string;
  setReturnsQuery: (query: string) => void;
  returnsStatusFilter: string;
  setReturnsStatusFilter: (value: string) => void;
  approveReturn: (id: string) => void;
  denyReturn: (id: string) => void;
  refundReturn: (id: string) => void;
  // reviews
  reviews: Review[];
  reviewsQuery: string;
  setReviewsQuery: (query: string) => void;
  reviewsStatusFilter: string;
  setReviewsStatusFilter: (value: string) => void;
  reviewsRatingFilter: string;
  setReviewsRatingFilter: (value: string) => void;
  setReviewStatus: (id: string, status: Review["status"]) => void;
  // customers
  customerPage: PaginatedView<Customer>;
  filteredCustomersCount: number;
  // audit
  auditEvents: AuditEvent[];
  // reports
  scheduledReports: ScheduledReport[];
  openNewReport: () => void;
  toggleScheduledReport: (id: string) => void;
  runScheduledReport: (id: string) => void;
  deleteScheduledReport: (id: string) => void;
  // users
  canManageUsers: boolean;
  invitationForm: InvitationForm;
  invitations: Invitation[];
  inviteUser: () => void;
  removeInvitation: (id: string) => void;
  setInvitationForm: (form: InvitationForm) => void;
  updateUserRole: (userId: string, role: AdminRole) => void;
  updateUserStatus: (userId: string, status: AdminUserStatus) => void;
  users: AdminUser[];
}) {
  const {
    section,
    activeProducts,
    lowStock,
    pendingOrders,
    revenue,
    currentRole,
    usersCount,
    invitationsCount,
    switchSection,
    products,
    orders,
    customers,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    productPage,
    filteredProductsCount,
    categories,
    bulkDeleteProducts,
    bulkUpdateProductStatus,
    deleteProduct,
    openEditProduct,
    openInventoryAdjustment,
    openNewProduct,
    deleteCategory,
    openNewCategory,
    discounts,
    openNewDiscount,
    deleteDiscount,
    orderPage,
    filteredOrdersCount,
    bulkUpdateOrderStatus,
    openNewOrder,
    openRefund,
    updateOrderStatus,
    returns,
    returnsQuery,
    setReturnsQuery,
    returnsStatusFilter,
    setReturnsStatusFilter,
    approveReturn,
    denyReturn,
    refundReturn,
    reviews,
    reviewsQuery,
    setReviewsQuery,
    reviewsStatusFilter,
    setReviewsStatusFilter,
    reviewsRatingFilter,
    setReviewsRatingFilter,
    setReviewStatus,
    customerPage,
    filteredCustomersCount,
    auditEvents,
    scheduledReports,
    openNewReport,
    toggleScheduledReport,
    runScheduledReport,
    deleteScheduledReport,
    canManageUsers,
    invitationForm,
    invitations,
    inviteUser,
    removeInvitation,
    setInvitationForm,
    updateUserRole,
    updateUserStatus,
    users,
  } = props;

  return (
    <>
      {section === "dashboard" ? (
        <DashboardSection
          activeProducts={activeProducts}
          lowStock={lowStock}
          orders={orders}
          pendingOrders={pendingOrders}
          products={products}
          revenue={revenue}
          currentRole={currentRole}
          usersCount={usersCount}
          invitationsCount={invitationsCount}
          setSection={switchSection}
        />
      ) : null}
      {section === "analytics" ? (
        <AnalyticsSection
          orders={orders}
          products={products}
          customers={customers}
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
          openInventoryAdjustment={openInventoryAdjustment}
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
          totalCount={filteredProductsCount}
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
          totalCount={filteredOrdersCount}
          updateOrderStatus={updateOrderStatus}
        />
      ) : null}
      {section === "returns" ? (
        <ReturnsSection
          returns={returns}
          query={returnsQuery}
          setQuery={setReturnsQuery}
          statusFilter={returnsStatusFilter}
          setStatusFilter={setReturnsStatusFilter}
          onApprove={approveReturn}
          onDeny={denyReturn}
          onRefund={refundReturn}
        />
      ) : null}
      {section === "reviews" ? (
        <ReviewsSection
          reviews={reviews}
          query={reviewsQuery}
          setQuery={setReviewsQuery}
          statusFilter={reviewsStatusFilter}
          setStatusFilter={setReviewsStatusFilter}
          ratingFilter={reviewsRatingFilter}
          setRatingFilter={setReviewsRatingFilter}
          onApprove={(id) => setReviewStatus(id, "Approved")}
          onFlag={(id) => setReviewStatus(id, "Flagged")}
          onReject={(id) => setReviewStatus(id, "Rejected")}
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
          totalCount={filteredCustomersCount}
        />
      ) : null}
      {section === "audit" ? <AuditLogSection events={auditEvents} /> : null}
      {section === "reports" ? (
        <ReportsSection
          reports={scheduledReports}
          openNewReport={openNewReport}
          onToggle={toggleScheduledReport}
          onRunNow={runScheduledReport}
          onDelete={deleteScheduledReport}
        />
      ) : null}
      {section === "emails" ? (
        <EmailTemplatesSection
          customers={customers}
          orders={orders}
          products={products}
          storeName="StoreOps"
        />
      ) : null}
      {section === "settings" ? <SettingsSection /> : null}
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
          users={users}
        />
      ) : null}
    </>
  );
}
