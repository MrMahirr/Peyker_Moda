import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BarcodeDisplayProps {
    barcode: string;
    productName: string;
    variantName?: string;
    price?: number;
    currency?: string;
    showPrintButton?: boolean;
    className?: string;
}

const formatCurrency = (value: number, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(value);
};

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
    barcode,
    productName,
    variantName,
    price,
    currency = 'TRY',
    showPrintButton = true,
    className
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const printAreaRef = useRef<HTMLDivElement>(null);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (svgRef.current && barcode) {
            try {
                JsBarcode(svgRef.current, barcode, {
                    format: 'EAN13',
                    lineColor: '#000',
                    width: 2,
                    height: 50,
                    displayValue: true,
                    fontSize: 14,
                    margin: 10,
                    textMargin: 4,
                    background: 'transparent'
                });
                setIsRendered(true);
            } catch (error) {
                console.error("Barcode render error:", error);
                // Fallback for non-EAN13 formats
                try {
                    JsBarcode(svgRef.current, barcode, {
                        format: 'CODE128',
                        width: 2,
                        height: 50,
                        displayValue: true,
                        fontSize: 14,
                        margin: 10,
                        background: 'transparent'
                    });
                    setIsRendered(true);
                } catch (e) {
                    console.error("Fallback barcode render error:", e);
                }
            }
        }
    }, [barcode]);

    const handlePrint = () => {
        if (!printAreaRef.current) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = printAreaRef.current.innerHTML;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Barkod Yazdir - ${barcode}</title>
                    <style>
                        @page { margin: 0; size: auto; }
                        body { 
                            margin: 0; 
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            font-family: system-ui, -apple-system, sans-serif;
                            background: white;
                        }
                        .print-container {
                            width: 100%;
                            text-align: center;
                            padding: 10px;
                        }
                        .store-name {
                            font-size: 11px;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 2px;
                        }
                        .product-name {
                            font-size: 13px;
                            font-weight: 700;
                            margin-bottom: 2px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 100%;
                        }
                        .variant-name {
                            font-size: 10px;
                            color: #555;
                            margin-bottom: 5px;
                        }
                        .price {
                            font-size: 16px;
                            font-weight: 800;
                            margin-top: 5px;
                        }
                        svg {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${content}
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className={cn("flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm", className)}>
            <div ref={printAreaRef} className="text-center w-full max-w-[250px] bg-white">
                <div className="store-name text-xs font-black tracking-wider text-zinc-900 uppercase mb-1">Peyker Moda</div>
                <div className="product-name text-sm font-bold text-zinc-900 truncate px-2 leading-tight">{productName}</div>
                {variantName && (
                    <div className="variant-name text-[11px] text-zinc-500 mb-1 leading-tight">{variantName}</div>
                )}
                
                <div className="flex justify-center w-full overflow-hidden bg-white rounded">
                    <svg ref={svgRef} className="max-w-full" />
                </div>
                
                {price !== undefined && (
                    <div className="price text-lg font-black text-zinc-900 mt-1">
                        {formatCurrency(price, currency)}
                    </div>
                )}
            </div>

            {showPrintButton && isRendered && (
                <Button 
                    onClick={handlePrint} 
                    variant="outline" 
                    className="w-full gap-2 border-zinc-300 hover:bg-zinc-100"
                >
                    <Printer className="w-4 h-4" />
                    Yazdir
                </Button>
            )}
        </div>
    );
};
