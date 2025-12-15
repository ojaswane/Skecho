// calling the api from google fonts
const res = await fetch("https://fonts.google.com/metadata/fonts");

const text = await res.text();

const json = JSON.parse(text.replace(")]}'", ""));

export const fonts = json.familyMetadataList;