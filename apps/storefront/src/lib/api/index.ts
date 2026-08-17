// Storefront API facade. Domain implementations live in ./*Service.ts.
export * from "./types";
export { API_BASE_URL } from "./config";

import { addressService } from "./addressService";
import { authService } from "./authService";
import { cartService } from "./cartService";
import { categoryService } from "./categoryService";
import { checkoutService } from "./checkoutService";
import { contentService } from "./contentService";
import { couponService } from "./couponService";
import { favoriteService } from "./favoriteService";
import { orderService } from "./orderService";
import { productService } from "./productService";

export const storeApi = {
  ...categoryService,
  ...productService,
  ...cartService,
  ...checkoutService,
  ...orderService,
  ...authService,
  ...couponService,
  ...favoriteService,
  ...addressService,
  ...contentService,
};
