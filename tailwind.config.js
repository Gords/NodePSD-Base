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
          primary: '#FF5656',
          secondary: '#6A7EFC',
          accent: '#494953',
          neutral: '#EDF2F6',
          'base-100': '#ffffff',
          info: '#669bbc',
          success: '#90D26D',
          warning: '#FFC94A',
          error: '#FA7070',
        "--rounded-box": "2rem", // border radius rounded-box utility class, used in card and other large boxes
        }
      },
      'dark',
      'retro'
    ]
  }
}
