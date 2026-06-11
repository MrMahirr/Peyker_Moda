import { toast } from "sonner";
import { storeApi } from "@/lib/api";
import { swal } from "@/utils/swal";

export function useOrderReturn(orderId: string) {
  const requestReturn = async () => {
    const { value: reason } = await swal.fire({
      title: "Iade Nedeni",
      input: "textarea",
      inputLabel: "Lutfen iade nedeninizi kisaca belirtiniz",
      inputPlaceholder: "Urun bedeni uymadi, bekledigim gibi degil vb...",
      showCancelButton: true,
      confirmButtonText: "Talebi Gonder",
      cancelButtonText: "Iptal",
      inputValidator: (value) => {
        if (!value) return "Iade nedeni girmelisiniz!";
        return null;
      },
    });

    if (!reason) return;

    try {
      const res = await storeApi.createReturn(orderId, reason);
      if (res.error) {
        toast.error(res.message || "Iade talebi olusturulurken hata olustu.");
        return;
      }

      toast.success("Iade talebiniz basariyla olusturuldu.");
    } catch {
      toast.error("Iade islemi sirasinda bir hata olustu.");
    }
  };

  return { requestReturn };
}
