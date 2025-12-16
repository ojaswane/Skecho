// =============== TODO ADD google FOnts ===================
// // calling the api from google fonts
// const res = await fetch("https://fonts.google.com/metadata/fonts");

// const text = await res.text();

// const json = JSON.parse(text.replace(")]}'", ""));

// export const fonts = json.familyMetadataList;

export const SANS_SERIF_FONTS = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "DM Sans",
    "Nunito",
    "Manrope",
    "Work Sans",
    "Plus Jakarta Sans",
    "Source Sans 3",
    "Rubik",
    "Urbanist",
    "Archivo",
];


export const SERIF_FONTS = [
    "Playfair Display",
    "Merriweather",
    "Libre Baskerville",
    "Lora",
    "Cormorant",
    "Crimson Text",
    "Spectral",
    "Bodoni Moda",
    "PT Serif",
    "Noto Serif",
];

export const PLAYFUL_FONTS = [
    "Comic Neue",
    "Baloo 2",
    "Fredoka",
    "Chewy",
    "Bubblegum Sans",
    "Patrick Hand",
    "Short Stack",
    "Sniglet",
    "Indie Flower",
    "Luckiest Guy",
];

export const JAPANESE_FONTS = [
    "Noto Sans JP",
    "Noto Serif JP",
    "Kosugi",
    "Kosugi Maru",
    "M PLUS 1",
    "M PLUS Rounded 1c",
    "Sawarabi Gothic",
    "Sawarabi Mincho",
];

export const RETRO_FONTS = [
    "VT323",
    "Press Start 2P",
    "Orbitron",
    "Share Tech Mono",
    "Silkscreen",
    "Oxanium",
    "Audiowide",
    "Monoton",
];


export const VINTAGE_FONTS = [
    "Abril Fatface",
    "Cinzel",
    "Alfa Slab One",
    "IM Fell English",
    "Bebas Neue",
    "Playfair Display SC",
    "Old Standard TT",
];

export const MINIMAL_FONTS = [
    "Inter",
    "DM Sans",
    "Manrope",
    "Space Grotesk",
    "Archivo",
    "Work Sans",
];

export const SKETCHY_FONTS = [
    "Architects Daughter",
    "Patrick Hand",
    "Gloria Hallelujah",
    "Caveat",
    "Handlee",
    "Permanent Marker",
    "Shadows Into Light",
];

export const ALL_FONTS = Array.from(
    new Set([
        ...SANS_SERIF_FONTS,
        ...SERIF_FONTS,
        ...PLAYFUL_FONTS,
        ...JAPANESE_FONTS,
        ...RETRO_FONTS,
        ...VINTAGE_FONTS,
        ...MINIMAL_FONTS,
        ...SKETCHY_FONTS,
    ])
)
export const loadGoogleFont = (font: string) => {
    const id = `font-${font.replace(/\s+/g, "-")}`

    if (document.getElementById(id)) return

    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
        /\s+/g,
        "+"
    )}:wght@300;400;500;600;700&display=swap`

    document.head.appendChild(link)
}