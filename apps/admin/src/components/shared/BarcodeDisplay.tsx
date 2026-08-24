import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    formatLabelPrice,
    renderLabelHtml,
    LABEL_PRINT_STYLES,
    BARCODE_RENDER_OPTIONS,
    JSBARCODE_CDN_URL,
    LABEL_WIDTH_MM,
    LABEL_HEIGHT_MM
} from './labelPrint';

interface BarcodeDisplayProps {
    barcode: string;
    productName: string;
    variantName?: string;
    price?: number;
    currency?: string;
    showPrintButton?: boolean;
    className?: string;
}

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
                    ...BARCODE_RENDER_OPTIONS,
                    lineColor: '#000',
                    background: 'transparent'
                });
                setIsRendered(true);
            } catch (error) {
                console.error('Barkod render hatası:', error);
            }
        }
    }, [barcode]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Barkod Yazdir - ${barcode}</title>
                    <script src="${JSBARCODE_CDN_URL}"></script>
                    <style>${LABEL_PRINT_STYLES}</style>
                </head>
                <body>
                    ${renderLabelHtml({ barcode, productName, variantName, price, currency })}
                    <script>
                        window.onload = () => {
                            const svg = document.querySelector('.barcode-svg');
                            JsBarcode(svg, svg.getAttribute('data-barcode'), ${JSON.stringify(BARCODE_RENDER_OPTIONS)});

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

    return (
        <div className={cn("flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm", className)}>
            <div
                ref={printAreaRef}
                className="flex flex-col items-center bg-white"
                style={{ width: `${LABEL_WIDTH_MM}mm`, minHeight: `${LABEL_HEIGHT_MM}mm`, padding: '1.6mm 2.6mm', boxSizing: 'border-box' }}
            >
                <div
                    className="w-full text-center font-extrabold tracking-wide text-zinc-900 uppercase"
                    style={{ fontSize: '2.6mm', marginBottom: '0.6mm' }}
                >
                    Peyker Moda
                </div>
                <div
                    className="w-full text-center font-black text-black leading-tight"
                    style={{
                        fontSize: '3.4mm',
                        marginBottom: '0.8mm',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        WebkitTextStroke: '0.25px currentColor'
                    }}
                >
                    {productName}
                </div>

                <div className="w-full flex items-baseline justify-between" style={{ marginBottom: '0.8mm' }}>
                    <span
                        className="font-black uppercase text-black"
                        style={{ fontSize: '3mm', WebkitTextStroke: '0.25px currentColor' }}
                    >
                        {variantName || ''}
                    </span>
                    {price !== undefined && (
                        <span className="font-extrabold text-zinc-900" style={{ fontSize: '3.6mm' }}>
                            {formatLabelPrice(price, currency)}
                        </span>
                    )}
                </div>

                <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: '20mm' }}>
                    <svg ref={svgRef} style={{ maxWidth: '92%', maxHeight: '100%' }} />
                </div>
            </div>

            {showPrintButton && isRendered && (
                <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="w-full gap-2 border-zinc-300 hover:bg-zinc-100"
                >
                    <Printer className="w-4 h-4" />
                    Yazdır
                </Button>
            )}
        </div>
    );
};
