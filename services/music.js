import { request } from "undici";

const { LIDARR_API_URL, LIDARR_API_KEY } = process.env;

export async function getMusicSuggestions(term = "", signal, requestTimeout = 3e3) {
  const encodedTerm = encodeURIComponent(term);
  const { statusCode, body } = await request(
    `${LIDARR_API_URL}/artist/lookup?term=${encodedTerm}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": LIDARR_API_KEY,
      },
      signal,
      requestTimeout,
    }
  );

  if (statusCode === 200) {
    const results = await body.json();
    const firstResults = results.slice(0, 5);
    return firstResults.map((result) => ({
      name: `🎧 ${result.artistName} (${result.disambiguation || "Unknown"})`,
      value: `${result.foreignArtistId}`,
    }));
  }

  return [];
}

export async function addMusic(foreignArtistId) {
  const artist = await getArtistByForeignId(foreignArtistId);
  const qualityProfileId = await getQualityProfileId();
  const rootFolderPath = await getMusicRootFolderPath();

  if (!artist || !qualityProfileId || !rootFolderPath) return null;

  artist.qualityProfileId = qualityProfileId;
  artist.rootFolderPath = rootFolderPath;
  artist.monitored = true;
  artist.addOptions = {
    monitor: "all",
    searchForMissingAlbums: true,
    monitored: true,
  };

  const { statusCode, body } = await request(`${LIDARR_API_URL}/artist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": LIDARR_API_KEY,
    },
    body: JSON.stringify(artist),
  });

  if (statusCode === 201) {
    const response = await body.json();
    return `${response.artistName} (${response.disambiguation || "Unknown"})`;
  }

  return null;
}

async function getArtistByForeignId(foreignArtistId) {
  const { statusCode, body } = await request(
    `${LIDARR_API_URL}/artist/lookup?term=lidarr:${foreignArtistId}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": LIDARR_API_KEY,
      },
    }
  );

  if (statusCode === 200) {
    const results = await body.json();
    return results[0];
  }

  return null;
}

async function getQualityProfileId(profileName = "Any") {
  const { statusCode, body } = await request(`${LIDARR_API_URL}/qualityprofile`, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": LIDARR_API_KEY,
    },
  });

  if (statusCode === 200) {
    const results = await body.json();
    return results.find((r) => r.name === profileName)?.id ?? 1;
  }

  return null;
}

async function getMusicRootFolderPath() {
  const { statusCode, body } = await request(`${LIDARR_API_URL}/rootfolder`, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": LIDARR_API_KEY,
    },
  });

  if (statusCode === 200) {
    const results = await body.json();
    return results.find((r) => r.path.endsWith("music"))?.path;
  }

  return null;
}
