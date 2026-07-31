import { toast } from "sonner";
import { storeApi } from "@/lib/api";
import { swal } from "@/utils/swal";
import { Order } from "../types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function useOrderReturn(order: Order) {
  const requestReturn = async () => {
    const returnableItems = order.items.filter(
      (item) => item.variantId && item.returnableQuantity > 0,
    );

    if (returnableItems.length === 0) {
      toast.info("Bu sipariste iade edilebilir urun bulunmuyor.");
      return;
    }

    const itemsHtml = returnableItems
      .map(
        (item, index) => `
          <label class="flex items-start gap-3 rounded-lg border border-stone-200 p-3 text-left">
            <input type="checkbox" class="return-item mt-1" data-index="${index}" checked />
            <span class="flex-1">
              <span class="block text-sm font-medium text-stone-900">${escapeHtml(item.name)}</span>
              <span class="block text-xs text-stone-500">Iade edilebilir: ${item.returnableQuantity}</span>
            </span>
            <input
              type="number"
              min="1"
              max="${item.returnableQuantity}"
              value="${item.returnableQuantity}"
              class="return-quantity w-16 rounded-md border border-stone-200 px-2 py-1 text-sm"
              data-index="${index}"
            />
          </label>
        `,
      )
      .join("");

    const { value } = await swal.fire({
      title: "Iade Nedeni",
      html: `
        <div class="space-y-3">
          <textarea id="return-reason" class="swal2-textarea" placeholder="Urun bedeni uymadi, bekledigim gibi degil vb..."></textarea>
          <div class="space-y-2">${itemsHtml}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Talebi Gonder",
      cancelButtonText: "Iptal",
      preConfirm: () => {
        const reason = (
          document.getElementById("return-reason") as HTMLTextAreaElement | null
        )?.value.trim();

        if (!reason) {
          swal.showValidationMessage("Iade nedeni girmelisiniz.");
          return false;
        }

        const selectedItems = Array.from(
          document.querySelectorAll<HTMLInputElement>(".return-item:checked"),
        )
          .map((checkbox) => {
            const index = Number(checkbox.dataset.index);
            const item = returnableItems[index];
            const quantityInput = document.querySelector<HTMLInputElement>(
              `.return-quantity[data-index="${index}"]`,
            );
            const quantity = Number(quantityInput?.value || 0);

            if (!item?.variantId || quantity < 1) return null;

            return {
              variantId: item.variantId,
              quantity: Math.min(quantity, item.returnableQuantity),
              reason,
            };
          })
          .filter(
            (
              item,
            ): item is {
              variantId: string;
              quantity: number;
              reason: string;
            } => Boolean(item),
          );

        if (selectedItems.length === 0) {
          swal.showValidationMessage("En az bir urun secmelisiniz.");
          return false;
        }

        return { reason, items: selectedItems };
      },
    });

    if (!value) return;

    try {
      const res = await storeApi.createReturn(order.id, value);
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
