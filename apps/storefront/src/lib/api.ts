// Storefront API facade. Domain implementations live in ./api/*Service.ts.
export * from "./api/types";
export { API_BASE_URL } from "./api/config";

import { addressService } from "./api/addressService";
import { authService } from "./api/authService";
import { cartService } from "./api/cartService";
import { categoryService } from "./api/categoryService";
import { checkoutService } from "./api/checkoutService";
import { contentService } from "./api/contentService";
import { couponService } from "./api/couponService";
import { favoriteService } from "./api/favoriteService";
import { orderService } from "./api/orderService";
import { productService } from "./api/productService";

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
