import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260911224652 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "gallery_item" ("id" text not null, "url" text not null, "title" text not null, "rank" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gallery_item_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_gallery_item_deleted_at" ON "gallery_item" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "gallery_item" cascade;`);
  }
}
