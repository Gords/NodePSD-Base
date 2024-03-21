/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html, js}'],
  theme: {
    extend: {},
    daisyui: {
      themes: ['light', 'dark', 'corporate', 'retro']
    }
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/forms'),
  ]
}
