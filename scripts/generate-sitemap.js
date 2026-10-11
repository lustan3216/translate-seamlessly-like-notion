import fs from 'fs';
import path from 'path';

// Sitemap generator functions
const generateSitemap = (entries) => {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const footer = '</urlset>';
  
  const urls = entries.map(entry => {
    let urlXml = `  <url>\n    <loc>${entry.url}</loc>`;
    
    if (entry.lastmod) {
      urlXml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
    }
    
    if (entry.changefreq) {
      urlXml += `\n    <changefreq>${entry.changefreq}</changefreq>`;
    }
    
    if (entry.priority !== undefined) {
      urlXml += `\n    <priority>${entry.priority.toFixed(1)}</priority>`;
    }
    
    urlXml += '\n  </url>';
    return urlXml;
  }).join('\n');
  
  return `${header}\n${urls}\n${footer}`;
};

const getStaticSitemapEntries = () => {
  const baseUrl = 'https://anytranslator.app';
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      url: `${baseUrl}/support`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.3
    }
  ];
};

const generateMultilingualSitemap = () => {
  const languages = ['en', 'ru', 'es', 'it', 'fr', 'de', 'ko', 'ja', 'pt-br', 'fi', 'da', 'nl', 'no', 'sv', 'zh-cn', 'zh-tw', 'id', 'vi', 'th'];
  const baseEntries = getStaticSitemapEntries();
  const allEntries = [];
  
  baseEntries.forEach(entry => {
    // Default English version
    allEntries.push(entry);
    
    // Other language versions
    languages.slice(1).forEach(lang => {
      const langUrl = entry.url + (entry.url === 'https://anytranslator.app' ? '' : '') + `?lang=${lang}`;
      allEntries.push({
        ...entry,
        url: langUrl,
        priority: entry.priority ? entry.priority * 0.8 : undefined
      });
    });
  });
  
  return generateSitemap(allEntries);
};

// Generate sitemap
const sitemapContent = generateMultilingualSitemap();

// Ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write sitemap.xml
const sitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

console.log('✅ Generated sitemap.xml with multilingual support');
console.log(`📍 Location: ${sitemapPath}`);
console.log(`📊 Total URLs: ${(sitemapContent.match(/<url>/g) || []).length}`);