import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
import { PageHeader } from '@/components/shared/PageHeader';
    messagingService,
    type BulkMessageJob,
    type MessagingChannel,
    type MessagingChannelStatus,
} from '../services/messaging.service';

const emptyForm = {
    channel: 'EMAIL' as MessagingChannel,
    title: '',
    content: '',
};

const channelLabels: Record<MessagingChannel, string> = {
    EMAIL: 'E-posta',
    SMS: 'SMS',
};

const statusLabels: Record<BulkMessageJob['status'], string> = {
    PENDING_PROVIDER: 'Provider Bekliyor',
    QUEUED: 'Kuyrukta',
    SENT: 'Gonderildi',
    FAILED: 'Basarisiz',
};

export const BulkMessageSender = () => {
    const [channelStatuses, setChannelStatuses] = useState<MessagingChannelStatus[]>([]);
    const [jobs, setJobs] = useState<BulkMessageJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        void loadMessagingData();
    }, []);

    const selectedChannelStatus = useMemo(
        () =>
            channelStatuses.find((status) => status.channel === formData.channel),
        [channelStatuses, formData.channel],
    );

    const loadMessagingData = async () => {
        try {
            setLoading(true);
            const [statuses, messages] = await Promise.all([
                messagingService.getChannelStatuses(),
                messagingService.getBulkMessages(),
            ]);
            setChannelStatuses(statuses);
            setJobs(messages);
        } catch {
            toast.error('Mesaj modulu verileri yuklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error('Baslik ve mesaj icerigi zorunludur');
            return;
        }

        try {
            setSubmitting(true);
            const createdJob = await messagingService.createBulkMessage({
                channel: formData.channel,
                title: formData.title.trim(),
                content: formData.content.trim(),
                audienceType: 'ALL_ACTIVE_CUSTOMERS',
            });

            setJobs((current) => [createdJob, ...current]);
            setFormData(emptyForm);

            if (createdJob.status === 'PENDING_PROVIDER') {
                toast.success('Talep kaydedildi. Provider entegrasyonu sonrasinda islenecek.');
            } else {
                toast.success('Toplu mesaj kuyruga alindi');
            }
        } catch {
            toast.error('Toplu mesaj talebi olusturulamadi');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div>
                <PageHeader title="Toplu Mesaj Gönderimi" />
                <p className="text-zinc-500">Musterilere SMS veya e-posta gonderim talepleri olusturun.</p>
            </div>

            <div className="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-[13px] text-amber-800">
                Email ve SMS provider entegrasyonlari henuz bagli degil. Bu ekran, talepleri kaydeder ve
                entegrasyon sonrasi islenmek uzere bekletir.
            </div>

            <div className="max-w-2xl space-y-4 bg-white p-6 rounded-2xl border border-zinc-200">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Kanal</label>
                    <select
                        value={formData.channel}
                        onChange={(event) =>
                            setFormData((current) => ({
                                ...current,
                                channel: event.target.value as MessagingChannel,
                            }))
                        }
                        className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {Object.entries(channelLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedChannelStatus ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[13px] text-zinc-600">
                        <span className="font-semibold text-zinc-900">{channelLabels[selectedChannelStatus.channel]}</span>
                        {' '}kanali: {selectedChannelStatus.reason}
                    </div>
                ) : null}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Baslik</label>
                    <Input
                        placeholder="Kampanya Basligi"
                        value={formData.title}
                        onChange={(event) =>
                            setFormData((current) => ({ ...current, title: event.target.value }))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">Mesaj Icerigi</label>
                    <textarea
                        className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[140px] resize-none"
                        placeholder="Mesajinizi buraya yazin..."
                        value={formData.content}
                        onChange={(event) =>
                            setFormData((current) => ({ ...current, content: event.target.value }))
                        }
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmit} loading={submitting} className="font-semibold">
                        {!submitting ? <Send className="w-4 h-4" /> : null}
                        {selectedChannelStatus?.available ? 'Kuyruga Al' : 'Talebi Kaydet'}
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900">Toplu Mesaj Talepleri</h2>
                    <p className="text-[13px] text-zinc-500 mt-1">Olusturulan talepler entegrasyon sonrasinda islenecek.</p>
                </div>

                {jobs.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center text-[13px] text-zinc-500">
                        Henuz toplu mesaj talebi olusturulmamis.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobs.map((job) => (
                            <div key={job.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-zinc-900">{job.title}</p>
                                        <div className="flex flex-wrap gap-3 text-[12px] text-zinc-500">
                                            <span>Kanal: {channelLabels[job.channel]}</span>
                                            <span>Hedef: {job.audience.recipientCount} musteri</span>
                                            <span>Durum: {statusLabels[job.status]}</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-[11px] text-zinc-400">
                                        <p>{new Date(job.createdAt).toLocaleString('tr-TR')}</p>
                                        <p>{job.requestedByName ?? 'Sistem'}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-[13px] text-zinc-600 whitespace-pre-wrap">{job.content}</p>
                                <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12px] text-zinc-500">
                                    {job.providerReason}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
