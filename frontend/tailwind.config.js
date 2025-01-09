module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, 
  theme: {
    extend: {
      colors: {
        'light-pink-orange': '#ffad99',
        'pink-orange': '#ff8466',
        'dark-pink-orange': '#ff704d',
        'words-pink-orange': '#ff704d'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};