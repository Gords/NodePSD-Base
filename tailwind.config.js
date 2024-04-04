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
          primary: '#B03422',
          secondary: '#2B3467',
          accent: '#8D99AE',
          neutral: '#EDF2F4',
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
