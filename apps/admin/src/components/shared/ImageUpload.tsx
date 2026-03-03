import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../lib/utils';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { uploadService } from '../../services/upload.service';

interface ImageUploadProps {
    value?: string[];
    onChange?: (urls: string[]) => void;
    maxFiles?: number;
    className?: string;
}

export function ImageUpload({
    value = [],
    onChange,
    maxFiles = 5,
    className,
}: ImageUploadProps) {
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState<string[]>(value);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setLoading(true);
        try {
            // Upload files to backend
            const results = await uploadService.uploadMultipleFiles(acceptedFiles, 'products');

            // Get URLs from response
            const newUrls = results.map(result => result.url);

            // Update state
            const updatedPreviews = [...previews, ...newUrls].slice(0, maxFiles);
            setPreviews(updatedPreviews);
            onChange?.(updatedPreviews);
        } catch (error) {
            console.error('Upload failed:', error);
            // Optionally add toast notification here
        } finally {
            setLoading(false);
        }
    }, [previews, maxFiles, onChange]);

    const removeImage = async (indexToRemove: number) => {
        const urlToRemove = previews[indexToRemove];

        // Optimistic update
        const updated = previews.filter((_, index) => index !== indexToRemove);
        setPreviews(updated);
        onChange?.(updated);

        // Delete from server (optional, but good for cleanup)
        // Extract filename from URL
        try {
            const filename = urlToRemove.split('/').pop();
            if (filename) {
                await uploadService.deleteFile(filename, 'products');
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
        },
        maxFiles: maxFiles - previews.length,
        disabled: previews.length >= maxFiles || loading,
    });

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-slate-50 relative",
                    isDragActive && "border-indigo-500 bg-indigo-50",
                    (previews.length >= maxFiles || loading) && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                {loading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                        <p className="text-sm text-slate-500">Yükleniyor...</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-100 p-3 rounded-full mb-3">
                            <Upload className="h-6 w-6 text-slate-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            Resim yüklemek için tıklayın veya sürükleyin
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            (Max {maxFiles} resim)
                        </p>
                    </>
                )}
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            <img
                                src={url}
                                alt="Upload preview"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
