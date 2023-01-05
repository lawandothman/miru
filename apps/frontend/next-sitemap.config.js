/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://miru.space',
  generateRobotsTxt: true, // (optional)
  // ...other options
}
