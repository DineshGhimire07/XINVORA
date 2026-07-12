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

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    console.log("Beginning RLS rollback transaction...");
    await sql.begin(async (tx) => {
      // 1. Disable RLS on all tables
      for (const table of allTables) {
        console.log(`Disabling RLS on ${table}...`);
        await tx.unsafe(`ALTER TABLE public."${table}" DISABLE ROW LEVEL SECURITY;`);
      }

      // 2. Drop all policies
      for (const table of publicTables) {
        console.log(`Dropping public SELECT policy on ${table}...`);
        await tx.unsafe(`DROP POLICY IF EXISTS "Allow public read access" ON public."${table}";`);
      }

      console.log("Dropping user-scoped policies...");
      await tx.unsafe('DROP POLICY IF EXISTS "Users can view own row" ON public."users";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can update own row" ON public."users";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can view own profile" ON public."profiles";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can update own profile" ON public."profiles";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own wishlist" ON public."wishlists";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own cart" ON public."carts";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own address" ON public."addresses";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can view own orders" ON public."orders";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can create own orders" ON public."orders";');
      await tx.unsafe('DROP POLICY IF EXISTS "Users can manage own notifications" ON public."notifications";');
    });

    console.log("RLS rollback transaction committed successfully!");
  } catch (err) {
    console.error("Rollback failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
