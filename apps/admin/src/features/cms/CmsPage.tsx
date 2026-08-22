import { useState } from 'react';
import { FileText, HelpCircle, Rss, Image, LayoutTemplate } from 'lucide-react';
import { BlogManager } from './components/BlogManager';
import { FaqManager } from './components/FaqManager';
import { PageManager } from './components/PageManager';
import { SliderManager } from '../crm/components/SliderManager';
import { PageHeaderManager } from '../crm/components/PageHeaderManager';
import { PageHeader } from '@/components/shared/PageHeader';

type Tab = 'slider' | 'page-headers' | 'blog' | 'pages' | 'faq';

export const CmsPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('slider');
    const tabs = [
        { key: 'slider' as Tab, label: 'Slider', icon: Image },
        { key: 'page-headers' as Tab, label: 'Kategori Banner', icon: LayoutTemplate },
        { key: 'blog' as Tab, label: 'Blog', icon: Rss },
        { key: 'pages' as Tab, label: 'Sayfalar', icon: FileText },
        { key: 'faq' as Tab, label: 'S.S.S.', icon: HelpCircle },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5">
                <div>
                    <PageHeader title="İçerik Yönetimi (CMS)" subtitle="Vitrin, blog, sayfa ve banner yönetimi." />
                    <p className="text-sm font-medium text-zinc-500 mt-1">
                        Ana sayfa slider, blog yazıları ve kurumsal sayfalar.
                    </p>
                </div>
                <div className="flex flex-wrap bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/50 shadow-inner">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                activeTab === tab.key
                                    ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm min-h-[400px]">
                {activeTab === 'slider' && <div className="p-6"><SliderManager /></div>}
                {activeTab === 'page-headers' && <div className="p-6"><PageHeaderManager /></div>}
                {activeTab === 'blog' && <BlogManager />}
                {activeTab === 'pages' && <PageManager />}
                {activeTab === 'faq' && <FaqManager />}
            </div>
        </div>
    );
};
