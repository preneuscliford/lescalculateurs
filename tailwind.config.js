import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {},
  },
  // daisyUI 5 lit ses options ici (l'ancienne clé `daisyui: { themes }` de la v4 était
  // ignorée) : sans elles, il activait son thème sombre quand le système est en mode
  // sombre (texte clair hérité sur les fonds blancs du site, champs de formulaire sombres).
  // Le site n'a qu'un thème clair.
  plugins: [daisyui({ themes: ["light --default"] })],
};
