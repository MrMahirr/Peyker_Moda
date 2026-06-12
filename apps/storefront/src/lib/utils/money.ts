type MoneyInput = string | number | null | undefined;

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

const toNumber = (value: MoneyInput) => {
  if (typeof value === "string") return parseFloat(value);
  return Number(value);
};

export const formatPrice = (price: MoneyInput) => {
  const numericPrice = toNumber(price);

  if (Number.isNaN(numericPrice)) {
    return currencyFormatter.format(0);
  }

  return currencyFormatter.format(numericPrice);
};

export const calculateDiscount = (
  price: MoneyInput,
  compareAtPrice: MoneyInput,
) => {
  const currentPrice = toNumber(price);
  const originalPrice = toNumber(compareAtPrice);

  if (
    Number.isNaN(currentPrice) ||
    Number.isNaN(originalPrice) ||
    originalPrice <= 0 ||
    currentPrice >= originalPrice
  ) {
    return 0;
  }

  return Math.round((1 - currentPrice / originalPrice) * 100);
};
