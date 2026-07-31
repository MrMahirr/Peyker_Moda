import { toast } from "sonner";

const getProductName = (name?: string) => name || "Urun";

export const favoriteMessages = {
  loginRequired() {
    toast.error("Favorilere eklemek icin giris yapmalisiniz.");
  },

  added(name?: string) {
    toast.success(`${getProductName(name)} favorilere eklendi!`);
  },

  removed(name?: string) {
    toast.info(`${getProductName(name)} favorilerden cikarildi.`);
  },

  addFailed() {
    toast.error("Favorilere eklenirken bir hata olustu.");
  },

  removeFailed() {
    toast.error("Favorilerden cikarilirken bir hata olustu.");
  },
};
