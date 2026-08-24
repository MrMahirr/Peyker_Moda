-- AlterTable: add as nullable first (existing rows have no value yet)
ALTER TABLE "orders" ADD COLUMN "barcodeValue" TEXT;

-- Backfill: give every existing order a short, unique, purely numeric
-- barcode value (YYMMDD + a per-day sequence), independent of whatever
-- format orderNumber happens to be in for that row.
WITH numbered AS (
  SELECT
    "id",
    to_char("createdAt", 'YYMMDD') ||
      lpad(
        (ROW_NUMBER() OVER (PARTITION BY to_char("createdAt", 'YYMMDD') ORDER BY "createdAt"))::text,
        5,
        '0'
      ) AS "bcode"
  FROM "orders"
)
UPDATE "orders" o
SET "barcodeValue" = numbered."bcode"
FROM numbered
WHERE o."id" = numbered."id";

-- AlterTable: now safe to enforce NOT NULL
ALTER TABLE "orders" ALTER COLUMN "barcodeValue" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_barcodeValue_key" ON "orders"("barcodeValue");
