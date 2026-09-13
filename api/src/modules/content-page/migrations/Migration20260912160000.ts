import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912160000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "content_page" add column if not exists "title" text null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "content_page" drop column if exists "title";`,
    );
  }
}
