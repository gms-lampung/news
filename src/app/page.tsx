import { getLatestNews, formatJakarta, getBMKGNotice } from '@/lib/news';

export const revalidate = 1800; // 30 min

export default async function NewsPage() {
  const items = await getLatestNews();
  const bmkgNotice = await getBMKGNotice();
  const generatedAt = formatJakarta(new Date().toISOString());

  return (
    <>
      {/* Navbar */}
            <nav className="gms-gradient" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 1rem', color:'#fff', boxShadow:'0 2px 10px rgba(0,43,130,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', margin:'0 0.5rem' }}>
                <h1 className="m-0 font-semibold tracking-wide" style={{ fontSize: '18px' }}>50 Berita Terkini</h1>
              </div>
            </nav>

      <div className="mx-auto w-full max-w-[960px] px-3">
        {/* Judul Section + Indikator */}
        <div className="section-title-wrap pt-4 pb-3">
          <h2 className="page-title" style={{ fontSize: '0.875rem' }}>
            <i className="fa-solid fa-volcano section-icon"></i> Erupsi Gunung Anak Krakatau (Lampung)
          </h2>
          <div className="blue-indicator"></div>
          <p style={{ marginTop:'0.25rem', fontSize:'0.75rem', color:'var(--text-sub)' }}>
            Update otomatis tiap 30 menit · Dimuat ulang {generatedAt}
          </p>
        </div>

        {/* Status Card */}
        <div className="card-gms">
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'3rem', height:'3rem', borderRadius:'50%', backgroundColor:'#fef2f2', color:'#dc2626', fontSize:'1.25rem' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Gunung Anak Krakatau</p>
              <p style={{ fontSize: '0.75rem', color: '#5e6d82' }}>
                Status: <span className="siaga">SIAGA (Level III)</span> &middot; Radius bahaya 3 km
              </p>
            </div>
            <a href="https://magma.esdm.go.id" target="_blank" rel="noopener noreferrer" className="btn-gms-pill">
              <i className="fa-solid fa-satellite-dish" style={{ fontSize: '0.75rem' }}></i>
              PVMBG/MAGMA
            </a>
          </div>

          {/* Dynamic BMKG info */}
          <div className="card-gms mt-2" style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ color: '#0284c7', fontSize: '1.25rem', marginTop: '0.1rem' }}>
                <i className="fa-solid fa-circle-info"></i>
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#334155' }}>
                <strong style={{ color: '#0f172a' }}>Pemberitahuan PVMBG/BMKG:</strong>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                  {bmkgNotice.text
                    ? <><span>{bmkgNotice.text}</span> {' '}<a href={bmkgNotice.link} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 500 }}>Lihat selengkapnya →</a></>
                    : 'Gagal memuat info terbaru. Tetap waspada dan ikuti arahan petugas.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Berita */}
        {items.length === 0 ? (
          <div className="card-gms" style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: '0.5rem' }}></i>
            Tidak ada berita terbaru
          </div>
        ) : (
          <ol className="space-y-4 mt-6">
            {items.map((it, i) => (
              <li key={it.link} className="card-gms">
                <div style={{ marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', fontSize: '11px', color: '#5e6d82' }}>
                  <span className="badge-ibadah">#{items.length - i}</span>
                  <time dateTime={it.pubDate} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-regular fa-clock"></i> {formatJakarta(it.pubDate)}
                  </time>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <i className="fa-solid fa-newspaper"></i> {it.source}
                  </span>
                </div>
                <a href={it.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#18233b', textDecoration: 'none', lineHeight: '1.4' }}>
                  {it.title}
                </a>
              </li>
            ))}
          </ol>
        )}

        <footer className="footer" style={{ marginTop: '2rem', borderTop: '1px solid #d0d7de', paddingTop: '1rem', fontSize: '11px', color: '#5e6d82', textAlign: 'center' }}>
          Sumber: Google News · BMKG · PVMBG / MAGMA Indonesia · Auto-refresh 30 menit
        </footer>
      </div>
    </>
  );
}
