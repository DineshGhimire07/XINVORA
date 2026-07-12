import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const publicTables = [
  "products",
  "variants",
  "product_images",
  "variant_images",
  "categories",
  "collections",
  "brands",
  "colors",
  "sizes",
  "materials",
  "product_materials",
  "product_collections",
  "product_tags",
  "tags",
  "price_books",
  "price_book_entries",
  "inventory",
  "announcements",
  "app_settings",
  "cms_blocks",
  "cms_pages",
  "cms_sections",
  "homepage_settings",
  "journal_categories",
  "journal_posts",
  "menu_items",
  "navigation_menus",
  "nepal_provinces",
  "nepal_districts",
  "nepal_municipalities",
  "reviews"
];

const privateTables = [
  "users",
  "profiles",
  "wishlists",
  "wishlist_items",
  "carts",
  "cart_items",
  "addresses",
  "orders",
  "order_items",
  "order_activity",
  "notifications",
  "admin_audit_logs",
  "audit_logs",
  "analytics_dlq",
  "cdp_settings",
  "coupons",
  "customer_metrics",
  "customer_timeline",
  "media_library",
  "payments",
  "recommendation_signals",
  "settings_history",
  "user_events",
  "user_sessions",
  "contact_inquiries"
];

const allTables = [...publicTables, ...privateTables];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  // Create connection
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    console.log("Starting table-by-table RLS migration...");

    for (const table of allTables) {
      console.log(`Migrating table: ${table}...`);
      try {
        await sql.begin(async (tx) => {
          // 1. Enable RLS
          await tx.unsafe(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);

          // 2. Add public read policies to storefront catalog tables
          if (publicTables.includes(table)) {
            await tx.unsafe(`DROP POLICY IF EXISTS "Allow public read access" ON public."${table}";`);
            await tx.unsafe(`CREATE POLICY "Allow public read access" ON public."${table}" FOR SELECT USING (true);`);
          }

          // 3. User-scoped policies
          if (table === "users") {
            await tx.unsafe('DROP POLICY IF EXISTS "Users can view own row" ON public."users";');
            await tx.unsafe('CREATE POLICY "Users can view own row" ON public."users" FOR SELECT USING (id = auth.uid());');
            await tx.unsafe('DROP POLICY IF EXISTS "Users can update own row" ON public."users";');
            await tx.unsafe('CREATE POLICY "Users can update own row" ON public."users" FOR UPDATE USING (id = auth.uid());');
          }

          if (table === "profiles") {
            await tx.unsafe('DROP POLICY IF EXISTS "Users can view own profile" ON public."profiles";');
            await tx.unsafe('CREATE POLICY "Users can view own profile" ON public."profiles" FOR SELECT USING (user_id = auth.uid());');
            await tx.unsafe('DROP POLICY IF EXISTS "Users can update own profile" ON public."profiles";');
            await tx.unsafe('CREATE POLICY "Users can update own profile" ON public."profiles" FOR UPDATE USING (user_id = auth.uid());');
          }

          if (table === "wishlists") {
            await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own wishlist" ON public."wishlists";');
            await tx.unsafe('CREATE POLICY "Users can manage own wishlist" ON public."wishlists" FOR ALL USING (user_id = auth.uid());');
          }

          if (table === "carts") {
            await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own cart" ON public."carts";');
            await tx.unsafe('CREATE POLICY "Users can manage own cart" ON public."carts" FOR ALL USING (user_id = auth.uid());');
          }

          if (table === "addresses") {
            await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own address" ON public."addresses";');
            await tx.unsafe('CREATE POLICY "Users can manage own address" ON public."addresses" FOR ALL USING (user_id = auth.uid());');
          }

          if (table === "orders") {
            await tx.unsafe('DROP POLICY IF EXISTS "Users can view own orders" ON public."orders";');
            await tx.unsafe('CREATE POLICY "Users can view own orders" ON public."orders" FOR SELECT USING (user_id = auth.uid());');
            await tx.unsafe('DROP POLICY IF EXISTS "Users can create own orders" ON public."orders";');
            await tx.unsafe('CREATE POLICY "Users can create own orders" ON public."orders" FOR INSERT WITH CHECK (user_id = auth.uid());');
          }

          if (table === "notifications") {
            await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own notifications" ON public."notifications";');
            await tx.unsafe('CREATE POLICY "Users can manage own notifications" ON public."notifications" FOR ALL USING (user_id = auth.uid());');
          }
        });
        console.log(`Successfully migrated RLS for table: ${table}`);
      } catch (err: any) {
        console.error(`Failed to migrate table ${table}:`, err.message || err);
        // Do not fail the whole process immediately, continue to try others
      }
    }

    console.log("RLS table-by-table migration complete!");
  } catch (err) {
    console.error("Migration wrapper failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
