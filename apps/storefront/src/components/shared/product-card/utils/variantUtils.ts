import { ProductVariant } from "@/lib/api";

export const getVariantSize = (variant: ProductVariant) =>
  variant.attributes?.size ||
  variant.attributes?.beden ||
  variant.attributes?.Beden ||
  variant.attributes?.Size ||
  (variant as unknown as { size?: string }).size ||
  "";

export const getVariantColor = (variant: ProductVariant) =>
  variant.attributes?.color ||
  variant.attributes?.renk ||
  variant.attributes?.Renk ||
  variant.attributes?.Color ||
  (variant as unknown as { color?: string }).color ||
  "";

export const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

export const buildVariantDescription = (size: string, color: string) =>
  [size, color].filter(Boolean).join(" / ");
