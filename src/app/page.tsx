import { getLatestNews, formatJakarta, getBMKGNotice, getPVMBGStatus } from '@/lib/news';

export const revalidate = 1800; // 30 min

const LEVEL_META: Record<number, { color: string; bg: string }> = {
  1: { color: '#15803d', bg: '#f0fdf4' },
  2: { color: '#b45309', bg: '#fffbeb' },
  3: { color: '#c2410c', bg: '#fff7ed' },
  4: { color: '#dc2626', bg: '#fef2f2' },
};

export default async function NewsPage() {
  const items = await getLatestNews();
  const bmkgNotice = await getBMKGNotice();
  const status = await getPVMBGStatus();
  const generatedAt = formatJakarta(new Date().toISOString());

  return (
    <>
      {/* Navbar */}
      <nav className="gms-gradient flex items-center justify-between px-10 py-3 text-white shadow-[0_2px_10px_rgba(0,43,130,0.15)]">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-church text-lg"></i>
          <h1 className="m-0 text-lg font-extrabold tracking-wide">50 Berita Terkini</h1>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-[960px] px-6">
        {/* Judul Section + Indikator */}
        <div className="section-title-wrap pt-4 pb-3">
          <h2 className="page-title flex items-center gap-2">
            <i className="fa-solid fa-volcano text-[#0052cc]"></i> Erupsi Gunung Anak Krakatau (Lampung)
          </h2>
          <div className="blue-indicator"></div>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-sub)' }}>
            Update otomatis tiap 30 menit · Dimuat ulang {generatedAt}
          </p>
        </div>

        {/* Status Card */}
        <div className="card-gms">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 text-xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-semibold">Gunung Anak Krakatau</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>
                Status:{' '}
                {status ? (
                  <>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[0.7rem] font-bold"
                      style={{
                        color: LEVEL_META[status.level].color,
                        backgroundColor: LEVEL_META[status.level].bg,
                      }}
                    >
                      {status.statusText}
                    </span>{' '}
                    {status.radiusKm ? (
                      <>&middot; Radius bahaya {status.radiusKm} km</>
                    ) : (
                      <>&middot; Radius larangan: sesuai rekomendasi PVMBG</>
                    )}
                  </>
                ) : (
                  <span className="text-amber-700">
                    Tidak dapat dimuat. Cek <a href="https://magma.esdm.go.id" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">MAGMA/PVMBG</a>
                  </span>
                )}
              </p>
            </div>
            <a href="https://magma.esdm.go.id" target="_blank" rel="noopener noreferrer" className="btn-gms-pill">
              <i className="fa-solid fa-satellite-dish text-xs mr-1"></i>
              PVMBG/MAGMA
            </a>
          </div>

          {/* Dynamic BMKG info */}
          <div className="card-gms mt-2 bg-slate-50 border-l-4 border-sky-600">
            <div className="flex items-start gap-3">
              <div className="text-sky-600 text-xl mt-0.5">
                <i className="fa-solid fa-circle-info"></i>
              </div>
              <div className="text-sm leading-relaxed text-slate-700">
                <strong className="text-slate-900">Pemberitahuan PVMBG/BMKG:</strong>
                <p className="mt-1 text-sm">
                  {bmkgNotice.text
                    ? <><span>{bmkgNotice.text}</span> {' '}<a href={bmkgNotice.link} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-medium">Lihat selengkapnya →</a></>
                    : 'Gagal memuat info terbaru. Tetap waspada dan ikuti arahan petugas.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Berita */}
        {items.length === 0 ? (
          <div className="card-gms text-center text-sm" style={{ color: 'var(--text-sub)' }}>
            <i className="fa-solid fa-circle-info mr-2"></i>
            Tidak ada berita terbaru
          </div>
        ) : (
          <ol className="space-y-4 mt-6">
            {items.map((it, i) => (
              <li key={it.link} className="card-gms">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--text-sub)' }}>
                  <span className="badge-ibadah">#{items.length - i}</span>
                  <time dateTime={it.pubDate} className="flex items-center gap-1">
                    <i className="fa-regular fa-clock"></i> {formatJakarta(it.pubDate)}
                  </time>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium">
                    <i className="fa-solid fa-newspaper"></i> {it.source}
                  </span>
                </div>
                <a href={it.link} target="_blank" rel="noopener noreferrer" className="block text-[15px] font-semibold leading-snug hover:underline" style={{ color: 'var(--text-main)' }}>
                  {it.title}
                </a>
              </li>
            ))}
          </ol>
        )}

        <footer className="mt-8 pt-4 text-center text-[11px]" style={{ borderTop: '1px solid var(--border-input)', color: 'var(--text-sub)' }}>
          Sumber: Google News · BMKG · PVMBG / MAGMA Indonesia · Auto-refresh 30 menit
        </footer>
      </div>
    </>
  );
}
