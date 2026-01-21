import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../lib/utils';
import { Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';

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
    const [previews, setPreviews] = useState<string[]>(value);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // In a real app, we would upload to a server/bucket here.
        // For now, we'll create local object URLs for preview.
        const newFiles = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );

        // @ts-ignore - handling Preview property on File object for display
        const newUrls = newFiles.map(file => file.preview);

        const updatedPreviews = [...previews, ...newUrls].slice(0, maxFiles);
        setPreviews(updatedPreviews);
        onChange?.(updatedPreviews);
    }, [previews, maxFiles, onChange]);

    const removeImage = (indexToRemove: number) => {
        const updated = previews.filter((_, index) => index !== indexToRemove);
        setPreviews(updated);
        onChange?.(updated);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
        },
        maxFiles: maxFiles - previews.length,
        disabled: previews.length >= maxFiles,
    });

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-slate-50",
                    isDragActive && "border-indigo-500 bg-indigo-50",
                    previews.length >= maxFiles && "opacity-50 cursor-not-allowed hidden"
                )}
            >
                <input {...getInputProps()} />
                <div className="bg-slate-100 p-3 rounded-full mb-3">
                    <Upload className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-900">
                    Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    SVG, PNG, JPG or GIF (max {maxFiles} files)
                </p>
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
                                    onClick={() => removeImage(index)}
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
