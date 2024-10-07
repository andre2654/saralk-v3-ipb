/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        'sk-color': {
          primary: '#2ECDFF',
          bg: '#1F1F1F',
          border: '#A6A6A6',
          warning: '#FB754B',
          block: {
            grassy: {
              primary: '#5bea83',
              secondary: '#27d758',
              border: '#0e9d1d',
            },
            rocky: {
              primary: '#cbc8c8',
              secondary: '#b2aaaa',
              border: '#7d7d7d',
            },
            sandy: {
              primary: '#d8ce78',
              secondary: '#c5ba5d',
              border: '#89771a',
            },
            swampy: {
              primary: '#5e7b09',
              secondary: '#495c10',
              border: '#404d1d',
            },
          },
        },
      },
      width: {
        'sk-width-block': '90px',
      },
      height: {
        'sk-height-block': '90px',
      },
      fontFamily: {
        'sk-font-pixel': ['DePixel'],
      },
    },
  },
  plugins: [],
}
