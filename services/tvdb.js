import { request } from "undici";

const { TVDB_API_URL, TVDB_API_KEY } = process.env;

export async function tvdbLogin() {
  const { TVDB_API_TOKEN_TTL } = process.env;

  if (+TVDB_API_TOKEN_TTL > Date.now()) return;

  const { statusCode, body } = await request(`${TVDB_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey: TVDB_API_KEY,
    }),
  });

  if (statusCode === 200) {
    const response = await body.json();
    process.env.TVDB_API_TOKEN = response?.data?.token;
    process.env.TVDB_API_TOKEN_TTL = Date.now();
  }
}
