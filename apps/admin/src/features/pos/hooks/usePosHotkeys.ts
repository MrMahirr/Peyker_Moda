import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UsePosHotkeysProps {
    onSearchFocus: () => void;
    onPayment: () => void;
    onBarcodeScanned: (barcode: string) => void;
}

export const usePosHotkeys = ({ onSearchFocus, onPayment, onBarcodeScanned }: UsePosHotkeysProps) => {
    // Buffer to store barcode characters
    const barcodeBuffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);
    const BARCODE_DELAY = 50; // Max ms between keystrokes for barcode

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();

            // 1. Handle Function Keys
            if (e.key === 'F2') {
                e.preventDefault();
                onSearchFocus();
                return;
            }

            if (e.key === 'F10') {
                e.preventDefault();
                onPayment();
                return;
            }

            // Odaklı bir metin alanı varsa (örn. İade & Değişim modalındaki
            // fiş/barkod arama kutusu) taramayı buraya bırakıyoruz — bu
            // window seviyesindeki dinleyici her zaman aktif olduğu için,
            // odaklı bir input'a yazılan/okutulan her şeyi AYRICA "ürün
            // barkodu" sanıp yanlışlıkla ürün aramasını da tetikliyordu
            // (örn. fiş barkodu okutulunca "Ürün bulunamadı" hatası).
            const active = document.activeElement;
            const isTypingInField =
                active instanceof HTMLElement &&
                (active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable);
            if (isTypingInField) {
                return;
            }

            // 2. Barcode Scanner Detection (Rapid Numeric Input)
            // Scanner acts like a keyboard, sending characters very fast.
            // We ignore special keys and non-printable chars.
            if (e.key.length === 1) {
                if (now - lastKeyTime.current < BARCODE_DELAY) {
                    barcodeBuffer.current += e.key;
                } else {
                    // Reset buffer if delay is too long (manual typing)
                    barcodeBuffer.current = e.key;
                }
                lastKeyTime.current = now;
            }

            // Scanner usually ends with Enter
            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 3 && (now - lastKeyTime.current < BARCODE_DELAY * 2)) {
                    // It's likely a barcode
                    e.preventDefault();
                    onBarcodeScanned(barcodeBuffer.current);
                    toast.success(`Barkod Okundu: ${barcodeBuffer.current}`);
                    barcodeBuffer.current = '';
                } else {
                    // Normal Enter key usage, reset barcode buffer
                    barcodeBuffer.current = '';
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSearchFocus, onPayment, onBarcodeScanned]);
};
