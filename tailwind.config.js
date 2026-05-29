// ============================================================
// tailwind.config.js
// Konfigurasi warna dan font kustom untuk Tailwind CSS.
// File ini di-load sebelum CDN Tailwind di setiap halaman.
// ============================================================

tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#1E3A8A",
        },
        accent: "#38BDF8",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
    },
  },
};
