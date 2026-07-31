import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white py-16">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <h2 className="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-6 inline-block">
          PEYKER MODA
        </h2>
        <p className="text-stone-400 mb-8 font-light max-w-md mx-auto">
          Zarafet ve modernliği buluşturan tasarımlarla kendi stil hikayeni yaz.
        </p>
        <div className="flex justify-center gap-6 text-stone-400 mb-8">
          {SOCIAL_LINKS.map((link) => (
            <Link key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-stone-500 text-sm">&copy; 2025 Peyker Moda. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}