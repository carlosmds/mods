const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

const i18nextConfig = {
  backend: {
    loadPath: path.join(__dirname, './locales/{{lng}}.json')
  },
  fallbackLng: 'en',
  supportedLngs: ['en', 'pt-BR'],
  preload: ['en', 'pt-BR'],
  detection: {
    order: ['header', 'querystring', 'cookie'],
    lookupHeader: 'accept-language',
    lookupQuerystring: 'lang',
    lookupCookie: 'i18next',
    caches: ['cookie']
  }
};

module.exports = {
  i18nextConfig,
  middleware
}; 