-- Suggested indexes for a multi-tenant expenses table (PostgreSQL).
-- Use CONCURRENTLY in production migrations to reduce lock impact.

-- Fast path for tenant + user scoped listing sorted by newest.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_tenant_user_created_at_desc
  ON "Expense" ("tenantId", "userId", "createdAt" DESC);

-- Date-range filters per tenant + user (reports, month views, exports).
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_tenant_user_date
  ON "Expense" ("tenantId", "userId", "date");

-- Category breakdown queries per tenant + user.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_tenant_user_category
  ON "Expense" ("tenantId", "userId", "categoryId");

-- If queries are not tenant scoped, keep user-first alternatives.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_created_at_desc
  ON "Expense" ("userId", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_date
  ON "Expense" ("userId", "date");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_category
  ON "Expense" ("userId", "categoryId");
