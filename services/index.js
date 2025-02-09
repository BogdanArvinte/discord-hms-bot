import { addMovie } from "./movie.js";
import { addTv } from "./tv.js";

const {
  RADARR_API_URL,
  RADARR_API_KEY,
  SONARR_API_URL,
  SONARR_API_KEY,
  LIDARR_API_URL,
  LIDARR_API_KEY,
} = process.env;

export async function addMedia(type, id) {
  if (type === "movie") return await addMovie(id);
  if (type === "tv") return await addTv(id);
  if (type === "music") return await addMusic(id);

  return null;
}

export function getServicesMap() {
  let services = {};

  if (RADARR_API_KEY && RADARR_API_URL) {
    services.movie = {
      name: "Movie",
      description: "Add a new movie to the library",
    };
  }

  if (SONARR_API_KEY && SONARR_API_URL) {
    services.tv = {
      name: "TV Show",
      description: "Add a new TV show to the library",
    };
  }

  if (LIDARR_API_KEY && LIDARR_API_URL) {
    services.music = {
      name: "Music",
      description: "Add a new artist to the library",
    };
  }

  return services;
}
