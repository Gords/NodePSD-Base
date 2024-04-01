module.exports = {
  content: ['./public/**/*.{html,js}'],
  plugins: [require('daisyui'), require('@tailwindcss/forms')],
  theme: {
    extend: {}
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#D90429',
          secondary: '#8D99AE',
          accent: '#EDF2F4',
          neutral: '#2B3467',
          'base-100': '#ffffff',
          info: '#669bbc',
          success: '#90D26D',
          warning: '#FFC94A',
          error: '#FA7070'
        }
      },
      'dark',
      'retro'
    ]
  }
}
