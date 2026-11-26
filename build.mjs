// Cloudflare Pages build: node build.mjs  (output directory: dist)
// Builds the Arabic site at / and the English site at /en/ from content/ar and content/en.
// Plain HTML output so search engines see everything without running JavaScript.
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://onewayeg.com';
const LANGS = ['ar', 'en'];
const PFX = { ar: '', en: '/en' };
const S = {
  ar: {
    dir: 'rtl', locale: 'ar_EG', switchLabel: 'English', switchLang: 'en',
    brand: 'ون واي ميديا', bizName: 'ون واي ميديا (OneWay Media)', city: '6 أكتوبر', region: 'الجيزة',
    home: 'الرئيسية', about: 'من نحن', articles: 'المقالات', contact: 'تواصل معنا', faq: 'الأسئلة الشائعة', privacy: 'سياسة الخصوصية',
    waBtn: 'ابعت رسالة على واتساب', askPkg: 'اسأل عن الباقة', seeWork: 'شوف شغلنا', allArticles: 'كل المقالات', allFaq: 'كل الأسئلة',
    phone: 'التليفون', whatsapp: 'واتساب', address: 'العنوان', email: 'الإيميل', openMap: 'افتح الخريطة', map: 'الخريطة',
    talkWa: 'كلمنا على واتساب', ready: 'جاهزين نرد عليك.', readyWa: 'جاهزين نرد عليك على واتساب.',
    addYt: 'ضيف لينك يوتيوب من اللوحة', photoHere: 'مكان الصور', defVideo: 'فيديو من ون واي ميديا', ytTitle: 'فيديو', workAlt: ' - ون واي ميديا',
    artTitle: 'مقالات ونصايح', artHead: 'مقالات ونصايح عن البث المباشر والتصوير | ون واي ميديا',
    artDesc: 'مقالات ونصايح عملية عن البث المباشر وتصوير الفيديو والتصوير الفوتوغرافي في مصر من ون واي ميديا.', artEmpty: 'هننزل مقالات ونصايح جديدة قريباً.',
    faqHead: 'الأسئلة الشائعة | ون واي ميديا', faqDesc: 'إجابات على أسئلة العملاء عن الأسعار ومدة التسليم ومناطق التغطية وطريقة الحجز مع ون واي ميديا.',
    floatWa: 'واتساب', logoAlt: 'شعار ون واي ميديا', defTitle: 'ون واي ميديا',
  },
  en: {
    dir: 'ltr', locale: 'en_US', switchLabel: 'العربية', switchLang: 'ar',
    brand: 'OneWay Media', bizName: 'OneWay Media', city: '6th of October City', region: 'Giza',
    home: 'Home', about: 'About us', articles: 'Articles', contact: 'Contact us', faq: 'FAQ', privacy: 'Privacy Policy',
    waBtn: 'Message us on WhatsApp', askPkg: 'Ask about this package', seeWork: 'See our work', allArticles: 'All articles', allFaq: 'All questions',
    phone: 'Phone', whatsapp: 'WhatsApp', address: 'Address', email: 'Email', openMap: 'Open the map', map: 'Map',
    talkWa: 'Talk to us on WhatsApp', ready: "We're ready to reply.", readyWa: "We're ready to reply on WhatsApp.",
    addYt: 'Add a YouTube link from the dashboard', photoHere: 'Photos go here', defVideo: 'Video by OneWay Media', ytTitle: 'Video', workAlt: ' - OneWay Media',
    artTitle: 'Articles and tips', artHead: 'Articles and Tips on Live Streaming and Photography | OneWay Media',
    artDesc: 'Practical articles and tips on live streaming, video production and photography in Egypt from OneWay Media.', artEmpty: 'New articles and tips are coming soon.',
    faqHead: 'FAQ | OneWay Media', faqDesc: 'Answers to client questions about prices, delivery time, coverage area and how to book with OneWay Media.',
    floatWa: 'WhatsApp', logoAlt: 'OneWay Media logo', defTitle: 'OneWay Media',
  },
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : SITE + (u.startsWith('/') ? u : '/' + u));
const ext = (u) => `href="${esc(u)}" target="_blank" rel="noopener noreferrer"`;
const fileOk = (u) => u && fs.existsSync('.' + (u.startsWith('/') ? u : '/' + u));
const ICONS = {
  live: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.2" fill="#fff" stroke="none"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/></svg>',
  video: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/></svg>',
  photo: '<svg viewBox="0 0 24 24"><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.6-2h5.8L16.5 6h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.8"/></svg>',
};
const mdInline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
const md = (src) => {
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push('<ul>' + list.map((x) => `<li>${mdInline(x)}</li>`).join('') + '</ul>'); list = []; } };
  for (const para of String(src || '').replace(/\r/g, '').split(/\n{2,}/)) {
    for (const line of para.split('\n').filter(Boolean)) {
      if (/^##\s+/.test(line)) { flush(); out.push(`<h2>${mdInline(line.replace(/^##\s+/, ''))}</h2>`); }
      else if (/^###\s+/.test(line)) { flush(); out.push(`<h3>${mdInline(line.replace(/^###\s+/, ''))}</h3>`); }
      else if (/^[-*]\s+/.test(line)) list.push(line.replace(/^[-*]\s+/, ''));
      else { flush(); out.push(`<p>${mdInline(line)}</p>`); }
    }
    flush();
  }
  return out.join('\n');
};
const ytId = (u) => { const m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/); return m ? m[1] : ''; };
const artDate = (a) => String(a.date || '').slice(0, 10);
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// ---------- load content for both languages ----------
const DATA = {};
for (const lang of LANGS) {
  const base = `content/${lang}`;
  const d = readJson(`${base}/site.json`);
  const articles = (d.articles || []).filter((a) => a && a.slug && a.title && (!a.draft || process.env.INCLUDE_DRAFTS))
    .sort((x, y) => String(y.date).localeCompare(String(x.date)));
  const pages = ['about', 'contact', 'privacy'].filter((k) => d.pages && d.pages[k] && d.pages[k].title && String(d.pages[k].body || '').trim()).map((k) => ({ slug: k, ...d.pages[k] }));
  DATA[lang] = { d, articles, pages, faqs: d.faq || [] };
}
// Arabic is the single source for entry. English only overrides prose; shared data always comes from Arabic,
// and empty English prose falls back to the Arabic text so no blanks appear.
const SHARED = [/^works\.\d+\.(photos|videos|type)$/, /^services\.\d+\.icon$/, /^videos\.\d+\.url$/, /^packages\.\d+\.(price|hot)$/, /^clients$/, /^socials\.\d+\.url$/, /^settings\.(whatsapp|phone|email|map)$/, /^logo\.image$/, /^favicon$/, /^seo\.shareImage$/];
const isShared = (p) => SHARED.some((r) => r.test(p));
const mergeEn = (a, e, p = '') => {
  if (isShared(p)) return a;
  if (Array.isArray(a)) return a.map((x, i) => mergeEn(x, Array.isArray(e) ? e[i] : undefined, `${p}${p ? '.' : ''}${i}`));
  if (a && typeof a === 'object') { const o = {}; for (const k of Object.keys(a)) o[k] = mergeEn(a[k], e && typeof e === 'object' ? e[k] : undefined, `${p}${p ? '.' : ''}${k}`); return o; }
  return e === undefined || e === null || String(e).trim() === '' ? a : e;
};
{
  const ar = DATA.ar.d, en = DATA.en.d;
  const merged = mergeEn({ ...ar, articles: undefined, pages: undefined }, { ...en, articles: undefined, pages: undefined });
  merged.articles = en.articles || []; merged.pages = en.pages || {};
  // reviews and FAQ are prose that cannot be shown in Arabic on an English page: keep only items that have English text
  merged.reviews = (en.reviews || []).filter((r) => r && String(r.text || '').trim()).map((r, i) => ({ ...(ar.reviews || [])[i], ...r }));
  merged.faq = (en.faq || []).filter((f) => f && String(f.q || '').trim() && String(f.a || '').trim());
  DATA.en.d = merged; DATA.en.faqs = merged.faq;
}
// which paths (without language prefix) exist per language
const PATHS = {};
for (const lang of LANGS) {
  const x = DATA[lang];
  PATHS[lang] = new Set(['/', ...x.pages.map((p) => `/${p.slug}/`), '/articles/', ...(x.faqs.length ? ['/faq/'] : []), ...x.articles.map((a) => `/articles/${a.slug}/`)]);
}
const alternates = (p) => LANGS.filter((l) => PATHS[l].has(p));
const hreflangTags = (p) => {
  const alts = alternates(p);
  if (alts.length < 2) return '';
  return alts.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${PFX[l]}${p}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${SITE}${p}">`;
};

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });
fs.copyFileSync('style.css', 'dist/style.css');
for (const dir of ['content', 'admin', 'uploads']) if (fs.existsSync(dir)) fs.cpSync(dir, path.join('dist', dir), { recursive: true });
let placeholderCount = 0;
const sitemapEntries = [];
const today = new Date().toISOString().slice(0, 10);

function buildLang(lang) {
  const s = S[lang];
  const P = PFX[lang];
  const other = s.switchLang;
  const { d, articles, pages, faqs } = DATA[lang];
  const outDir = path.join('dist', P);
  const w = (rel, content) => { const f = path.join(outDir, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content); };
  const url = (p) => P + p;
  const switchHref = (p) => (PATHS[other].has(p) ? PFX[other] + p : PFX[other] + '/');
  const switcher = (p) => `<a class="ow-lang" href="${switchHref(p)}" hreflang="${other}" lang="${other}">${s.switchLabel}</a>`;
  const t = d.titles;
  const wa = `https://wa.me/${d.settings.whatsapp}?text=` + encodeURIComponent(d.settings.whatsappMessage);
  const btn = (label) => `<a class="ow-btn" ${ext(wa)}>${esc(label)}</a>`;
  const sec = (cls, id, title, body) => `<section class="ow-sec ${cls}"${id ? ` id="${id}"` : ''}><h2>${esc(title)}</h2>${body}</section>`;
  const seo = d.seo || {};
  const title = seo.title || s.defTitle;
  const desc = seo.description || d.hero.text;
  const share = abs(seo.shareImage || '');
  const realSocials = d.socials.filter((x) => x.url && !/[\[\]]/.test(x.url));
  const logoOk = fileOk(d.logo && d.logo.image);
  const logo = logoOk ? `<img class="ow-logo" src="${esc(d.logo.image)}" alt="${esc(d.logo.alt || s.logoAlt)}" height="56">` : `<span class="ow-wordmark">${esc(s.brand)}</span>`;

  const ld = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: s.bizName, url: SITE + url('/'), description: desc, inLanguage: lang,
    telephone: '+' + d.settings.whatsapp, email: d.settings.email,
    address: { '@type': 'PostalAddress', streetAddress: d.settings.address, addressLocality: s.city, addressRegion: s.region, addressCountry: 'EG' },
    hasMap: d.settings.map, sameAs: realSocials.map((x) => x.url),
  };
  if (share) ld.image = share;
  if (logoOk) ld.logo = abs(d.logo.image);

  const videoLd = [];
  const ytCard = (v) => {
    const id = ytId(v.url);
    if (!id) return '';
    const name = v.title || s.defVideo;
    const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    if (v.date) videoLd.push({ '@context': 'https://schema.org', '@type': 'VideoObject', name, description: v.description || name, thumbnailUrl: thumb, uploadDate: v.date, embedUrl: `https://www.youtube.com/embed/${id}`, contentUrl: `https://www.youtube.com/watch?v=${id}` });
    return `<div class="ow-yt"><a class="ow-ytlink" href="https://www.youtube.com/watch?v=${id}" data-yt="${id}" target="_blank" rel="noopener noreferrer"><img src="${thumb}" alt="${esc(name)}" loading="lazy" decoding="async" width="480" height="360"><span class="ow-ytplay">▶</span></a><p>${esc(name)}</p></div>`;
  };
  const works = d.works.map((x) => {
    if (x.type === 'videos') {
      const cards = (x.videos || []).map(ytCard).filter(Boolean);
      return `<h3 class="ow-cat">${esc(x.name)}</h3><div class="ow-vgrid">${cards.length ? cards.join('') : `<div class="ow-tile"><span>${esc(x.name)}</span><small>${esc(s.addYt)}</small></div>`}</div>`;
    }
    const photos = (x.photos || []).map((p) => `<img class="ow-tile ow-img" loading="lazy" decoding="async" src="${esc(p.image)}" alt="${esc(x.name)}${esc(s.workAlt)}">`);
    return `<h3 class="ow-cat">${esc(x.name)}</h3><div class="ow-tiles">${(photos.length ? photos : [`<div class="ow-tile"><span>${esc(x.name)}</span><small>${esc(s.photoHere)}</small></div>`]).join('')}</div>`;
  }).join('');

  const artCard = (a) => `<a class="ow-card ow-art" href="${url(`/articles/${a.slug}/`)}">${a.cover ? `<img src="${esc(a.cover)}" alt="${esc(a.coverAlt || a.title)}" loading="lazy" decoding="async" width="640" height="360">` : ''}<h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></a>`;
  const articlesSec = articles.length ? sec('ow-alt', 'articles', t.articles || s.artTitle, `<div class="ow-grid">${articles.slice(0, 3).map(artCard).join('')}</div><p><a class="ow-link" href="${url('/articles/')}">${s.allArticles}</a></p>`) : '';

  const clientItem = (c) => c.logo ? `<div class="ow-logo-i"><img src="${esc(c.logo)}" alt="${esc(c.name)}" loading="lazy" decoding="async"></div>` : `<div class="ow-logo-i ow-logo-ph"><span>${esc(c.name)}</span></div>`;
  const clientsSec = (d.clients && d.clients.length) ? (() => {
    const reps = Math.max(1, Math.ceil(8 / d.clients.length));
    const half = Array.from({ length: reps }, () => d.clients).flat();
    const dur = Math.max(20, Math.round(half.length * 2.3));
    return sec('ow-clients', 'clients', t.clients, `<div class="ow-marquee" dir="ltr"><div class="ow-track" style="--dur:${dur}s">${half.map(clientItem).join('')}${half.map((c) => clientItem(c).replace('<div class="ow-logo-i', '<div aria-hidden="true" class="ow-logo-i').replace(' alt="' + esc(c.name) + '"', ' alt=""')).join('')}</div></div>`);
  })() : '';
  const faqHtml = faqs.map((f) => `<details class="ow-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');

  const head2 = ({ ttl, dsc, p, type = 'website', image = '', ldList = [] }) => `<!doctype html>
<html lang="${lang}" dir="${s.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(ttl)}</title>
<meta name="description" content="${esc(dsc)}">
<link rel="canonical" href="${SITE}${url(p)}">
${hreflangTags(p)}
${d.favicon ? `<link rel="icon" href="${esc(d.favicon)}">` : ''}
<meta property="og:type" content="${type}">
<meta property="og:locale" content="${s.locale}">
<meta property="og:site_name" content="${esc(s.brand)}">
<meta property="og:title" content="${esc(ttl)}">
<meta property="og:description" content="${esc(dsc)}">
<meta property="og:url" content="${SITE}${url(p)}">
${image ? `<meta property="og:image" content="${esc(abs(image))}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${esc(abs(image))}">` : '<meta name="twitter:card" content="summary">'}
<meta name="twitter:title" content="${esc(ttl)}">
<meta name="twitter:description" content="${esc(dsc)}">
${ldList.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
<link rel="stylesheet" href="/style.css">
</head>`;
  const footerHtml = (p) => `<footer class="ow-foot"><nav class="ow-fnav"><a href="${url('/about/')}">${s.about}</a><a href="${url('/articles/')}">${s.articles}</a>${faqs.length ? `<a href="${url('/faq/')}">${s.faq}</a>` : ''}<a href="${url('/contact/')}">${s.contact}</a><a href="${url('/privacy/')}">${s.privacy}</a>${switcher(p)}</nav>© ${esc(s.brand)}</footer>`;
  const shell = (inner, p) => `<body>
<div class="ow" dir="${s.dir}" lang="${lang}">
  <header class="ow-bar"><a href="${url('/')}" class="ow-brand">${logo}</a><nav><a href="${url('/')}">${s.home}</a><a href="${url('/about/')}">${s.about}</a><a href="${url('/articles/')}">${s.articles}</a><a href="${url('/contact/')}">${s.contact}</a>${switcher(p)}</nav></header>
  <main class="ow-page">${inner}</main>
  <section class="ow-sec ow-alt ow-contact"><h2>${s.talkWa}</h2><p>${s.ready}</p>${btn(s.waBtn)}</section>
  ${footerHtml(p)}
</div>
</body>
</html>
`;
  const crumbs = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: SITE + url(x[1]) })) });

  // ----- home -----
  const home = `${head2({ ttl: title, dsc: desc, p: '/', image: seo.shareImage || '', ldList: [ld, ...videoLd] }).replace('</head>', '</head>')}
<body>
<div class="ow" dir="${s.dir}" lang="${lang}">
  <header class="ow-hero"><div class="ow-herotop"><div class="ow-brand">${logo}</div>${switcher('/')}</div><h1>${esc(d.hero.title)}</h1><p>${esc(d.hero.text)}</p>${btn(d.hero.button)}<a class="ow-link" href="#work">${s.seeWork}</a></header>
  <main>
  ${sec('', 'services', t.services, `<div class="ow-grid">${d.services.map((x) => `<div class="ow-card ow-svc"><span class="ow-icon">${ICONS[x.icon] || ICONS.video}</span><h3>${esc(x.name)}</h3><p>${esc(x.text)}</p></div>`).join('')}</div>`)}
  ${sec('ow-alt', 'work', t.work, works)}
  ${sec('', 'videos', t.videos, `<div class="ow-grid">${d.videos.map((v) => `<a class="ow-card ow-vid" ${ext(v.url)}><span class="ow-play">▶</span><h3>${esc(v.title)}</h3><p>${esc(v.note)}</p></a>`).join('')}</div>`)}
  ${sec('ow-alt', 'packages', t.packages, `<div class="ow-grid">${d.packages.map((x) => `<div class="ow-card${x.hot ? ' ow-hot' : ''}"><h3>${esc(x.name)}</h3><div class="ow-price">${esc(x.price)}</div><ul>${x.items.map((i) => `<li>${esc(i.text)}</li>`).join('')}</ul>${btn(s.askPkg)}</div>`).join('')}</div>`)}
  ${sec('', 'steps', t.steps, `<ol class="ow-steps">${d.steps.map((x) => `<li>${esc(x.text)}</li>`).join('')}</ol>`)}
  ${clientsSec}
  ${d.reviews.length ? sec('ow-alt', 'reviews', t.reviews, `<div class="ow-grid">${d.reviews.map((r) => `<figure class="ow-card"><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.who)}${lang === 'ar' ? '،' : ','} ${esc(r.what)}</figcaption></figure>`).join('')}</div>`) : ''}
  ${articlesSec}
  ${faqs.length ? sec('', 'faq', t.faq, faqHtml + `<p><a class="ow-link" href="${url('/faq/')}">${s.allFaq}</a></p>`) : ''}
  ${sec('ow-alt', 'about', t.about, `<p class="ow-about">${esc(d.about.text)}</p>`)}
  <section class="ow-sec ow-contact" id="contact"><h2>${esc(t.contact)}</h2><p>${s.readyWa}</p>${btn(s.waBtn)}
    <dl><dt>${s.phone}</dt><dd dir="ltr"><a href="tel:+${esc(d.settings.whatsapp)}">${esc(d.settings.phone)}</a></dd><dt>${s.address}</dt><dd>${esc(d.settings.address)}</dd><dt>${s.email}</dt><dd dir="ltr">${esc(d.settings.email)}</dd></dl>
    <div class="ow-social"><a ${ext(d.settings.map)}>${s.map}</a>${d.socials.map((x) => `<a ${ext(x.url)}>${esc(x.name)}</a>`).join('')}</div></section>
  </main>
  ${footerHtml('/')}<a class="ow-float" ${ext(wa)}>${s.floatWa}</a>
</div>
<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.ow-ytlink');if(!a)return;e.preventDefault();var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+a.dataset.yt+'?autoplay=1&rel=0';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.title='${s.ytTitle}';f.className='ow-ytframe';a.replaceWith(f);});</script>
</body>
</html>
`;
  w('index.html', home);
  placeholderCount += (JSON.stringify(d).match(/\[[^\]"]{1,60}\]/g) || []).length;

  // ----- articles -----
  const pubLd = { '@type': 'Organization', name: s.brand, url: SITE + url('/'), ...(logoOk ? { logo: { '@type': 'ImageObject', url: abs(d.logo.image) } } : {}) };
  w('articles/index.html', head2({ ttl: s.artHead, dsc: s.artDesc, p: '/articles/', ldList: [crumbs([[s.home, '/'], [s.articles, '/articles/']])] }) + shell(`<h1>${s.artTitle}</h1>${articles.length ? `<div class="ow-grid">${articles.map(artCard).join('')}</div>` : `<p class="ow-meta">${s.artEmpty}</p>`}`, '/articles/'));
  for (const a of articles) {
    const p = `/articles/${a.slug}/`;
    const ld2 = { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description, inLanguage: lang, mainEntityOfPage: SITE + url(p), datePublished: artDate(a), dateModified: artDate(a), author: pubLd, publisher: pubLd, ...(a.cover ? { image: abs(a.cover) } : {}) };
    w(`articles/${a.slug}/index.html`, head2({ ttl: `${a.title} | ${s.brand}`, dsc: a.description, p, type: 'article', image: a.cover || '', ldList: [ld2, crumbs([[s.home, '/'], [s.articles, '/articles/'], [a.title, p]])] }) + shell(`<article class="ow-article"><p class="ow-crumb"><a href="${url('/')}">${s.home}</a> / <a href="${url('/articles/')}">${s.articles}</a></p><h1>${esc(a.title)}</h1><p class="ow-meta">${esc(artDate(a))}</p>${a.cover ? `<img class="ow-cover" src="${esc(a.cover)}" alt="${esc(a.coverAlt || a.title)}" width="800" height="450">` : ''}${md(a.body)}</article>`, p));
  }

  // ----- pages -----
  for (const pgd of pages) {
    const p = `/${pgd.slug}/`;
    const extra = pgd.slug === 'contact' ? `<div class="ow-card ow-cinfo">${btn(s.waBtn)}<dl><dt>${s.phone}</dt><dd dir="ltr"><a href="tel:+${esc(d.settings.whatsapp)}">${esc(d.settings.phone)}</a></dd><dt>${s.whatsapp}</dt><dd dir="ltr"><a ${ext(wa)}>${esc(d.settings.phone)}</a></dd><dt>${s.address}</dt><dd>${esc(d.settings.address)}</dd><dt>${s.email}</dt><dd dir="ltr"><a href="mailto:${esc(d.settings.email)}">${esc(d.settings.email)}</a></dd></dl><div class="ow-social"><a ${ext(d.settings.map)}>${s.openMap}</a>${d.socials.filter((x) => !x.url.includes('[')).map((x) => `<a ${ext(x.url)}>${esc(x.name)}</a>`).join('')}</div></div>` : '';
    w(`${pgd.slug}/index.html`, head2({ ttl: `${pgd.title} | ${s.brand}`, dsc: pgd.description, p, ldList: [crumbs([[s.home, '/'], [pgd.title, p]])] }) + shell(`<article class="ow-article"><h1>${esc(pgd.title)}</h1>${md(pgd.body)}${extra}</article>`, p));
  }

  // ----- FAQ page (FAQPage data only for answered questions, so placeholders never reach Google) -----
  if (faqs.length) {
    const real = faqs.filter((f) => !/[\[\]]/.test(f.q + f.a));
    const fl = real.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: real.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : [];
    w('faq/index.html', head2({ ttl: s.faqHead, dsc: s.faqDesc, p: '/faq/', ldList: [...fl, crumbs([[s.home, '/'], [s.faq, '/faq/']])] }) + shell(`<h1>${s.faq}</h1>${faqHtml}`, '/faq/'));
  }

  for (const p of PATHS[lang]) {
    const last = p.startsWith('/articles/') && p !== '/articles/' ? (artDate(articles.find((a) => `/articles/${a.slug}/` === p) || {}) || today) : today;
    sitemapEntries.push({ p, lang, last });
  }
}

for (const lang of LANGS) buildLang(lang);

fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /content/\n\nSitemap: ${SITE}/sitemap.xml\n`);
const entry = (e) => {
  const alts = alternates(e.p);
  const links = alts.length > 1 ? alts.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${PFX[l]}${e.p}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${e.p}"/>` : '';
  return `<url><loc>${SITE}${PFX[e.lang]}${e.p}</loc><lastmod>${e.last}</lastmod>${links}</url>`;
};
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${sitemapEntries.map(entry).join('')}</urlset>\n`);
console.log(`built dist/ (ar at /, en at /en/). urls in sitemap: ${sitemapEntries.length}. placeholders still in content: ${placeholderCount}`);
