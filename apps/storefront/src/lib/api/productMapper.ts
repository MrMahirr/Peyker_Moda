import { Product } from "./types";

type BackendCampaign = {
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  discountValue?: string | number;
};

type BackendProduct = Product & {
  basePrice?: string | number;
  salePrice?: string | number;
  campaign?: BackendCampaign | null;
};

const toNumber = (value: string | number | undefined) => {
  if (value === undefined) return 0;
  return typeof value === "string" ? parseFloat(value) : Number(value);
};

export const mapProduct = (product: unknown): Product => {
  const source = product as BackendProduct | null | undefined;

  if (!source || source.price !== undefined) {
    return source as Product;
  }

  let campaignDiscount = 0;
  const basePrice = toNumber(source.basePrice);

  if (source.campaign) {
    if (source.campaign.discountType === "PERCENTAGE") {
      campaignDiscount =
        basePrice * (toNumber(source.campaign.discountValue) / 100);
    } else if (source.campaign.discountType === "FIXED_AMOUNT") {
      campaignDiscount = toNumber(source.campaign.discountValue);
    }
  }

  const salePrice = source.salePrice ? toNumber(source.salePrice) : undefined;
  let finalPrice = salePrice || basePrice;

  if (campaignDiscount > 0) {
    const calculatedCampaignPrice = basePrice - campaignDiscount;
    if (calculatedCampaignPrice < finalPrice) {
      finalPrice = calculatedCampaignPrice;
    }
  }

  return {
    ...source,
    price: finalPrice,
    compareAtPrice: finalPrice < basePrice ? basePrice : undefined,
  };
};
