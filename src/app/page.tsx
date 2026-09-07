import { getLatestNews, formatJakarta } from '@/lib/news';

export const revalidate = 1800; // 30 min

export default async function NewsPage() {
  const items = await getLatestNews();
  const generatedAt = formatJakarta(new Date().toISOString());

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Berita Erupsi Bandar Lampung
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update otomatis tiap 30 menit · Dimuat ulang: {generatedAt}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Status Gunung Anak Krakatau: <span className="font-semibold text-red-600">SIAGA (Level III)</span> · Radius bahaya 3 km dari kawah
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-gray-500">Tidak ada berita terbaru</p>
      ) : (
        <ol className="space-y-5">
          {items.map((it, i) => (
            <li key={it.link} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-red-50 px-2 py-0.5 font-mono text-red-700">
                  #{items.length - i}
                </span>
                <time dateTime={it.pubDate}>{formatJakarta(it.pubDate)}</time>
                <span>·</span>
                <span className="font-medium">{it.source}</span>
              </div>
              <a
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-lg font-semibold text-gray-900 hover:text-blue-700"
              >
                {it.title}
              </a>
              {it.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{it.description}</p>
              )}
            </li>
          ))}
        </ol>
      )}

      <footer className="mt-10 border-t border-gray-200 pt-4 text-xs text-gray-400">
        Sumber: Google News · PVMBG / MAGMA Indonesia · Refetch 30 menit
      </footer>
    </main>
  );
}
