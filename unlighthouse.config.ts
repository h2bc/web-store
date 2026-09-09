import { defineUnlighthouseConfig } from 'unlighthouse/config'

// Target a production build (`next build && next start`) or a deployed host;
// `next dev` fails minification and source-map audits and inflates every timing.
export default defineUnlighthouseConfig({
  site: process.env.LIGHTHOUSE_SITE ?? 'http://localhost:3000',
  scanner: {
    exclude: ['/cart', '/checkout/*', '/order/*'],
  },
  ci: {
    budget: {
      seo: 100,
      accessibility: 90,
      'best-practices': 90,
      performance: 70,
    },
  },
  puppeteerOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})
