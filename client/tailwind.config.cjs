module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6D5EF8', // Electric Iris
        secondary: '#B7A8FF', // Soft Orchid
        accent: '#FFC857', // Mango Gold
        highlight: '#D8CCFF', // Sky Lilac
        background: '#FCFBFF', // Moon White
        card: '#FFFFFF',
        border: '#EAE4FF',
        text: '#36334D',
      },
      fontFamily: {
        heading: ['Poppins', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '18px',
        '2xl': '22px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(13,12,27,0.06)',
        float: '0 12px 30px rgba(109,94,248,0.12)',
      },
    },
  },
  plugins: [],
}
