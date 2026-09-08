// Parse Google News RSS — returns sorted items (newest first)
// Lazy HTTPS fetch; no API key required.

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string;        // ISO 8601
  description: string;
};

const FEEDS = [
  'https://news.google.com/rss/search?q=erupsi+bandar+lampung+when:1d&hl=id&gl=ID&ceid=ID:id',
  'https://news.google.com/rss/search?q=abu+vulkanik+bandar+lampung+when:1d&hl=id&gl=ID&ceid=ID:id',
  'https://news.google.com/rss/search?q=anak+krakatau+lampung+when:1d&hl=id&gl=ID&ceid=ID:id',
];

function stripHtml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`);
      const x = block.match(r);
      return x ? x[1] : '';
    };
    const title = stripHtml(get('title'));
    const link = get('link').trim();
    const pubDate = get('pubDate').trim();
    const description = stripHtml(get('description'));
    const source = stripHtml(get('source'));
    if (!title || !link || !pubDate) continue;
    items.push({ title, link, source, pubDate: new Date(pubDate).toISOString(), description });
  }
  return items;
}

async function fetchOne(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 1800 }, // 30 min
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml);
  } catch {
    return [];
  }
}

export async function getLatestNews(): Promise<NewsItem[]> {
  const lists = await Promise.all(FEEDS.map(fetchOne));
  const seen = new Map<string, NewsItem>();
  for (const list of lists) {
    for (const it of list) {
      // Dedup by canonical Google News link (strip last path segment)
      const key = it.link.replace(/article\/[^/]+/, 'article/key');
      if (!seen.has(key)) seen.set(key, it);
    }
  }
  return [...seen.values()]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 50);
}

export type BMKGData = {
  status: string;
  level: number;
  radius: string;
  detail: string;
};

export type BMKGNotice = {
  text: string;
  link: string;
};

// Fetch latest @infobmkg post via Google Search RSS — auto-revalidates every 30 min
// Filter: focus on Anak Krakatau eruption relevant to Lampung; ignore the rest.
export async function getBMKGNotice(): Promise<BMKGNotice> {
  try {
    const FEEDS = [
      'https://news.google.com/rss/search?q=site:x.com+infobmkg+anak+krakatau+lampung+when:1d&hl=id&gl=ID&ceid=ID:id',
      'https://news.google.com/rss/search?q=site:x.com+infobmkg+erupsi+lampung+when:1d&hl=id&gl=ID&ceid=ID:id',
      'https://news.google.com/rss/search?q=infobmkg+anak+krakatau+erupsi+lampung+when:1d&hl=id&gl=ID&ceid=ID:id',
    ];
    const KEYWORDS = ['anak krakatau', 'krakatau', 'erupsi', 'lampung', 'sunda', 'vulkanik', 'abu vulkanik', 'sigi', 'sigmet'];

    const lists = await Promise.all(FEEDS.map(async url => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 1800 },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRss(xml);
      } catch {
        return [];
      }
    }));

    // Dedup by link; pick the newest item that mentions Anak Krakatau + Lampung
    const seen = new Map<string, NewsItem>();
    for (const list of lists) {
      for (const it of list) {
        const key = it.link.replace(/article\/[^/]+/, 'article/key');
        if (!seen.has(key)) seen.set(key, it);
      }
    }
    const items = [...seen.values()]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Find the first item that has BOTH Krakatau AND Lampung context
    for (const it of items) {
      const haystack = `${it.title} ${it.description}`.toLowerCase();
      const hasKrakatau = /krakatau/i.test(haystack);
      const hasLampung = /(lampung|sunda)/i.test(haystack);
      const hasOther = new RegExp(KEYWORDS.join('|'), 'i').test(haystack);
      if (hasKrakatau && hasLampung || hasKrakatau && hasOther) {
        return {
          text: `${it.description} (${formatJakarta(it.pubDate)})`,
          link: it.link,
        };
      }
    }
    return { text: '', link: '' };
  } catch {
    return { text: '', link: '' };
  }
}


export function formatJakarta(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' WIB';
}