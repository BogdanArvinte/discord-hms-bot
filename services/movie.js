import { request } from "undici";

const { RADARR_API_URL, RADARR_API_KEY } = process.env;

export async function getMovieSuggestions(term = "") {
  const { statusCode, body } = await request(`${RADARR_API_URL}/movie/lookup?term=${term}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": RADARR_API_KEY,
    },
  });

  if (statusCode === 200) {
    const results = await body.json();
    const firstResults = results.slice(0, 5);
    return firstResults.map((result) => ({
      name: `🎥 ${result.title} (${result.year})`,
      value: `${result.tmdbId}`,
    }));
  }

  return [];
}

export async function addMovie(tmdbId) {
  const movie = await getMovieByTmdbId(tmdbId);
  const qualityProfileId = await getQualityProfileId();
  const rootFolderPath = await getMovieRootFolderPath();

  if (!movie || !qualityProfileId || !rootFolderPath) return null;

  movie.qualityProfileId = qualityProfileId;
  movie.rootFolderPath = rootFolderPath;
  movie.monitored = true;
  movie.addOptions = {
    monitor: "movieOnly",
    searchForMovie: true,
    addMethod: "manual",
  };

  const { statusCode, body } = await request(`${RADARR_API_URL}/movie`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": RADARR_API_KEY,
    },
    body: JSON.stringify(movie),
  });

  if (statusCode === 201) {
    const response = await body.json();
    return `${response.title} (${response.year})`;
  }

  return null;
}

async function getMovieByTmdbId(tmdbId) {
  const { statusCode, body } = await request(
    `${RADARR_API_URL}/movie/lookup/tmdb?tmdbId=${tmdbId}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": RADARR_API_KEY,
      },
    }
  );

  if (statusCode === 200) {
    const result = await body.json();
    return result;
  }

  return null;
}

async function getQualityProfileId(profileName = "Any") {
  const { statusCode, body } = await request(`${RADARR_API_URL}/qualityprofile`, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": RADARR_API_KEY,
    },
  });

  if (statusCode === 200) {
    const results = await body.json();
    return results.find((r) => r.name === profileName)?.id ?? 1;
  }

  return 0;
}

async function getMovieRootFolderPath() {
  const { statusCode, body } = await request(`${RADARR_API_URL}/rootfolder`, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": RADARR_API_KEY,
    },
  });

  if (statusCode === 200) {
    const results = await body.json();
    return results.find((r) => r.path.endsWith("movies"))?.path;
  }

  return "";
}
