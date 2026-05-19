/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#00eaff",
                "background-light": "#f5f8f8",
                "background-dark": "#0f2223",
                "secondary-dark": "#163133",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "full": "9999px"
            },
            backgroundImage: {
                'mesh': 'radial-gradient(at 10% 10%, rgba(0, 234, 255, 0.15) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(0, 234, 255, 0.10) 0px, transparent 50%)',
            }
        },
    },
    plugins: [],
}
