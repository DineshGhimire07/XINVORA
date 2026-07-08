CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "products_name_trgm_idx" ON "products" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "products_desc_trgm_idx" ON "products" USING gin ("description" gin_trgm_ops);
