import { request } from "undici";

const { SONARR_API_URL, SONARR_API_KEY, TVDB_API_URL } = process.env;

export async function getTvSuggestions(query = "", signal, requestTimeout = 3e3) {
  const { TVDB_API_TOKEN } = process.env;
  const params = new URLSearchParams({ limit: 5, type: "series", query });

  const { statusCode, body } = await request(`${TVDB_API_URL}/search?${params}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TVDB_API_TOKEN}`,
    },
    signal,
    requestTimeout,
  });

  if (statusCode === 200) {
    const { data } = await body.json();
    return data?.map((result) => ({
      name: `📺 ${result.name} (${result.year})`,
      value: `${result.tvdb_id}`,
    }));
  }

  return [];
}

export async function addTv(tvdbId) {
  const series = await getSeriesByTvdbId(tvdbId);
  const qualityProfileId = await getQualityProfileId();
  const rootFolderPath = await getSeriesRootFolderPath();

  if (!series || !qualityProfileId || !rootFolderPath) return null;

  series.qualityProfileId = qualityProfileId;
  series.rootFolderPath = rootFolderPath;
  series.monitored = true;
  series.addOptions = {
    monitor: "unmonitorSpecials",
    searchForMissingEpisodes: true,
  };

  const { statusCode, body } = await request(`${SONARR_API_URL}/series`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": SONARR_API_KEY,
    },
    body: JSON.stringify(series),
  });

  if (statusCode === 201) {
    const response = await body.json();
    return `${response.title} (${response.year})`;
  }

  console.log(statusCode, body);
  return null;
}

async function getSeriesByTvdbId(tvdbId) {
  const { statusCode, body } = await request(
    `${SONARR_API_URL}/series/lookup?term=tvdb:${tvdbId}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": SONARR_API_KEY,
      },
    }
  );

  if (statusCode === 200) {
    const result = await body.json();
    return result[0];
  }

  return null;
}

async function getQualityProfileId(profileName = "Any") {
  const { statusCode, body } = await request(`${SONARR_API_URL}/qualityprofile`, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": SONARR_API_KEY,
    },
  });

  if (statusCode === 200) {
    const results = await body.json();
    return results.find((r) => r.name === profileName)?.id ?? 1;
  }

  return 0;
}

async function getSeriesRootFolderPath() {
  const { statusCode, body } = await request(`${SONARR_API_URL}/rootfolder`, {
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": SONARR_API_KEY,
    },
  });

  if (statusCode === 200) {
    const results = await body.json();
    return results.find((r) => r.path.endsWith("tv"))?.path;
  }

  return "";
}
