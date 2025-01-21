import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  devtools: { enabled: true },

  nitro: {
    experimental: {
      websocket: true
    }
  },

  ssr: false,

  plugins: [
    { src: '@/plugins/v-dragscroll.ts', ssr: false }
  ],

  css: ['@/assets/css/font.css', '@/assets/css/utilities.css'],

  vite: {
    plugins: [svgLoader()],
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint'
  ],

  i18n: {
    langDir: 'locales',
    lazy: true,
    baseUrl: 'localhost',
    locales: [
      {
        code: 'pt',
        iso: 'pt-BR',
        name: 'Português do Brasil',
        file: 'pt-BR',
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en-US',
      },
    ],
    defaultLocale: 'pt',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },

  imports: {
    dirs: ['services'],
  },
})