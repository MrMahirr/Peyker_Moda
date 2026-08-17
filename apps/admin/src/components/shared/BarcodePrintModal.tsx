import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Printer, Minus, Plus } from 'lucide-react';
import { BarcodeDisplay } from './BarcodeDisplay';

export interface BarcodePrintItem {
    id: string;
    barcode: string;
    productName: string;
    variantName?: string;
    price?: number;
    currency?: string;
}

interface BarcodePrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: BarcodePrintItem[];
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
    isOpen,
    onClose,
    items
}) => {
    // Default to 1 copy per item
    const [copies, setCopies] = useState<Record<string, number>>(
        items.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
    );

    const updateCopy = (id: string, delta: number) => {
        setCopies(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, Math.min(99, current + delta));
            return { ...prev, [id]: next };
        });
    };

    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Generate HTML for all copies of all items
        let labelsHtml = '';
        
        items.forEach(item => {
            const itemCount = copies[item.id] || 0;
            for (let i = 0; i < itemCount; i++) {
                labelsHtml += `
                    <div class="label">
                        <div class="store-name">PEYKER MODA</div>
                        <div class="product-name">${item.productName}</div>
                        ${item.variantName ? `<div class="variant-name">${item.variantName}</div>` : ''}
                        <div class="barcode-container">
                            <svg class="barcode-svg" data-barcode="${item.barcode}"></svg>
                        </div>
                        ${item.price !== undefined ? `<div class="price">${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: item.currency || 'TRY' }).format(item.price)}</div>` : ''}
                    </div>
                `;
            }
        });

        printWindow.document.write(`
            <html>
                <head>
                    <title>Toplu Barkod Yazdir</title>
                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                    <style>
                        @page { size: A4 portrait; margin: 10mm; }
                        body { 
                            margin: 0; 
                            padding: 0;
                            font-family: system-ui, -apple-system, sans-serif;
                            background: white;
                            display: flex;
                            flex-wrap: wrap;
                            align-content: flex-start;
                        }
                        .label {
                            /* A4 (210mm) - 20mm margin = 190mm. 190 / 4 = 47.5mm */
                            width: 47mm; 
                            height: 27mm;
                            border: 1px dashed #ccc;
                            padding: 2mm;
                            box-sizing: border-box;
                            text-align: center;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            overflow: hidden;
                            page-break-inside: avoid;
                            margin: 0.25mm;
                        }
                        .store-name {
                            font-size: 8px;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 2px;
                        }
                        .product-name {
                            font-size: 9px;
                            font-weight: 700;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 100%;
                            line-height: 1.2;
                            margin-bottom: 1px;
                        }
                        .variant-name {
                            font-size: 7px;
                            color: #333;
                            line-height: 1.2;
                        }
                        .barcode-container {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            margin: 2px 0;
                        }
                        .barcode-svg {
                            height: 12mm;
                        }
                        .price {
                            font-size: 11px;
                            font-weight: 800;
                            line-height: 1;
                        }
                        
                        @media print {
                            .label {
                                border: none; /* Hide dashed border on actual print */
                            }
                        }
                    </style>
                </head>
                <body>
                    ${labelsHtml}
                    <script>
                        window.onload = () => {
                            // Render barcodes
                            document.querySelectorAll('.barcode-svg').forEach(svg => {
                                const barcode = svg.getAttribute('data-barcode');
                                try {
                                    JsBarcode(svg, barcode, {
                                        format: 'EAN13',
                                        width: 1.5,
                                        height: 30,
                                        displayValue: true,
                                        fontSize: 10,
                                        margin: 0
                                    });
                                } catch(e) {
                                    JsBarcode(svg, barcode, {
                                        format: 'CODE128',
                                        width: 1.2,
                                        height: 30,
                                        displayValue: true,
                                        fontSize: 10,
                                        margin: 0
                                    });
                                }
                            });
                            
                            // Print after a short delay for rendering
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => window.close(), 500);
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const totalLabels = Object.values(copies).reduce((a, b) => a + b, 0);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Toplu Barkod Yazdır" 
            size="lg"
            bodyClassName="p-0"
        >
            <div className="flex flex-col max-h-[70vh]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center text-zinc-500 py-8">Yazdırılacak barkod bulunamadı.</div>
                    ) : (
                        <div className="grid gap-4">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                    <div className="w-32 flex-shrink-0 bg-white rounded border border-zinc-200 p-1 flex justify-center">
                                        <BarcodeDisplay 
                                            barcode={item.barcode} 
                                            productName={item.productName}
                                            variantName={item.variantName}
                                            price={item.price}
                                            currency={item.currency}
                                            showPrintButton={false}
                                            className="border-none shadow-none p-0 bg-transparent"
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-zinc-900 truncate">{item.productName}</div>
                                        {item.variantName && <div className="text-xs text-zinc-500 truncate">{item.variantName}</div>}
                                        <div className="text-xs font-mono text-zinc-400 mt-1">{item.barcode}</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => updateCopy(item.id, -1)}
                                            disabled={(copies[item.id] || 0) <= 0}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-8 text-center font-medium text-sm">
                                            {copies[item.id] || 0}
                                        </span>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => updateCopy(item.id, 1)}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 p-6 border-t border-zinc-100">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-zinc-500">
                            Toplam <span className="font-bold text-zinc-900">{totalLabels}</span> etiket
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>İptal</Button>
                            <Button onClick={handlePrintAll} disabled={totalLabels === 0} className="gap-2">
                                <Printer className="w-4 h-4" />
                                Yazdır
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
