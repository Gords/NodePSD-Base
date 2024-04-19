module.exports = {
  content: ['./public/**/*.{html,js}'],
  safelist: [
    'btn-success',
    'btn-sm',
    'btn-md',
    'hover',
    'hover:',
    'hover:cursor-pointer',
    'table',
    'display:grid',
    'table-pin-rows'
  ],
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
          success: '#84CC7D',
          warning: '#F2DC5D',
          error: '#FA7070',
        "--rounded-box": "2rem", // border radius rounded-box utility class, used in card and other large boxes
        }
      },
      'dark',
      'retro'
    ]
  }
}
