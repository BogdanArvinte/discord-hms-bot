import { getServicesMap } from "../services/index.js";
import { getMovieSuggestions } from "../services/movie.js";
import { getTvSuggestions } from "../services/tv.js";
import { getMusicSuggestions } from "../services/music.js";

export function getTypeSuggestions(channel, value) {
  const services = getServicesMap();
  const options = Object.keys(services);
  const index = options.findIndex((option) => option === channel);

  if (index !== -1) {
    const matched = options.splice(index, 1)[0];
    options.unshift(matched);
  }

  return options
    .filter((option) => {
      const service = services[option];
      return service.name.toLowerCase().includes(value.toLowerCase());
    })
    .map((option) => ({ name: services[option].name, value: option }));
}

export async function getTitleSuggestions(type = "", term = "") {
  const cleanedTerm = encodeURIComponent(term.trim());

  try {
    if (type === "movie") return await getMovieSuggestions(cleanedTerm);
    if (type === "tv") return await getTvSuggestions(cleanedTerm);
    if (type === "music") return await getMusicSuggestions(cleanedTerm);
  } catch (error) {
    console.error(error);
    return [];
  }
}
