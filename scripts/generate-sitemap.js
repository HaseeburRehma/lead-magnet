const fs = require("fs")
const path = require("path")

// Configure your domain
const domain = "https://ssm.alevdigital.com"
const currentDate = new Date().toISOString().split("T")[0]

// Define your routes
const routes = [
  {
    url: "/",
    lastmod: currentDate,
    changefreq: "monthly",
    priority: 1.0,
  },
]

// Generate sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${domain}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

// Write sitemap to public directory
fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), sitemap)
console.log("Sitemap generated successfully!")
