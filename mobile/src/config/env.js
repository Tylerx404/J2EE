const FALLBACK_API_URL = 'http://localhost:8080/api';

const normalizeUrl = (value) => value.replace(/\/+$/, '');

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (__DEV__ && !rawApiUrl) {
  console.warn(
    `EXPO_PUBLIC_API_URL is not set. Falling back to ${FALLBACK_API_URL}.`
  );
}

export const env = {
  apiUrl: normalizeUrl(rawApiUrl || FALLBACK_API_URL),
};
