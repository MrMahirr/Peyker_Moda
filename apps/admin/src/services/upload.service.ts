import api from '../lib/axios';

export interface UploadResult {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
}

export const uploadService = {
    async uploadFile(file: File, folder: string = 'products'): Promise<UploadResult> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/upload/single?folder=${folder}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data || response.data;
    },

    async uploadMultipleFiles(files: File[], folder: string = 'products'): Promise<UploadResult[]> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await api.post(`/upload/multiple?folder=${folder}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data || response.data;
    },

    async deleteFile(filename: string, folder: string = 'products'): Promise<boolean> {
        const response = await api.delete(`/upload/${folder}/${filename}`);
        return response.data.success;
    }
};
