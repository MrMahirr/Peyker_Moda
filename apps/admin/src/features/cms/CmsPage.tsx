import { useState } from 'react';
import { FileText, HelpCircle, Rss } from 'lucide-react';
import { BlogManager } from './components/BlogManager';
import { FaqManager } from './components/FaqManager';
import { PageManager } from './components/PageManager';

type Tab = 'blog' | 'pages' | 'faq';

export const CmsPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>('blog');
    const tabs = [
        { key: 'blog' as Tab, label: 'Blog & Haberler', icon: Rss },
        { key: 'pages' as Tab, label: 'Sabit Sayfalar', icon: FileText },
        { key: 'faq' as Tab, label: 'S.S.S.', icon: HelpCircle },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Icerik Yonetimi (CMS)</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">
                        Blog yazilari, kurumsal sayfalar ve sikca sorulan sorular.
                    </p>
                </div>
                <div className="flex bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/50 shadow-inner">
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
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm min-h-[400px]">
                {activeTab === 'blog' && <BlogManager />}
                {activeTab === 'pages' && <PageManager />}
                {activeTab === 'faq' && <FaqManager />}
            </div>
        </div>
    );
};
