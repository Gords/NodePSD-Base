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
    'table-pin-rows',
    'no-animation',
    'overflow-x-auto',
    'alert-warning',
    'alert-error',
    'alert-success'
  ],
  plugins: [require('daisyui'), require('@tailwindcss/forms')],
  theme: {
    screens: {
      'xs': '320px',
      // => @media (mind-width: 320px)

      'sm': '640px',
      // => @media (min-width: 640px)

      'md': '768px',
      // => @media (min-width: 768px)

      'lg': '1024px',
      // => @media (min-width: 1024px)

      'xl': '1280px',
      // => @media (min-width: 1280px)

      '2xl': '1536px',
      // => @media (min-width: 1536px)
    },
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
