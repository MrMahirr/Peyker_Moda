import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScanLine } from 'lucide-react';

interface BarcodeScannerProps {
    onScan?: (code: string) => void;
    placeholder?: string;
}

export const BarcodeScanner = ({ onScan, placeholder = 'Barkod okutun veya yazin...' }: BarcodeScannerProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleScan = () => {
        const code = value.trim();
        if (!code) return;
        onScan?.(code);
        setHistory((prev) => [code, ...prev].slice(0, 5));
        setValue('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-100 rounded-lg">
                    <ScanLine className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-900">Barkod Okuyucu</h3>
                    <p className="text-[12px] text-zinc-500">Okuyucuyu input alanina odaklayin.</p>
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleScan();
                        }
                    }}
                    placeholder={placeholder}
                    className="h-11"
                />
                <Button onClick={handleScan} className="font-semibold">Ekle</Button>
            </div>

            {history.length > 0 && (
                <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Son Okunanlar</div>
                    <div className="space-y-1 text-[13px] font-mono text-zinc-700">
                        {history.map((item) => (
                            <div key={item}>{item}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
