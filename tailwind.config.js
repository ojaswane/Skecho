module.exports = {
  theme: {
    extend: {
      fontFamily: {
        bricolage: ['var(--font-bricolage)'],
        parisienne: ['var(--font-parisienne)'],
      },
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
      },
      animation: {
        shine: 'shine 5s linear infinite',
      },
    },
  },
  plugins: [],
};
