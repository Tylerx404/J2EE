const { expo: baseConfig } = require('./app.json');

const APP_ENV = process.env.APP_ENV?.trim() || 'development';
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const DEFAULT_DEV_API_URL = 'http://localhost:8080/api';

const variants = {
  development: {
    appName: `${baseConfig.name} Dev`,
    slug: `${baseConfig.slug.toLowerCase()}-dev`,
    androidPackage: `${baseConfig.android.package}.dev`,
    iosBundleIdentifier: `${baseConfig.ios.bundleIdentifier}.dev`,
  },
  preview: {
    appName: `${baseConfig.name} Preview`,
    slug: `${baseConfig.slug.toLowerCase()}-preview`,
    androidPackage: `${baseConfig.android.package}.preview`,
    iosBundleIdentifier: `${baseConfig.ios.bundleIdentifier}.preview`,
  },
  production: {
    appName: baseConfig.name,
    slug: baseConfig.slug,
    androidPackage: baseConfig.android.package,
    iosBundleIdentifier: baseConfig.ios.bundleIdentifier,
  },
};

if (!variants[APP_ENV]) {
  throw new Error(
    `Unsupported APP_ENV "${APP_ENV}". Use development, preview, or production.`
  );
}

if (!API_URL && APP_ENV !== 'development') {
  throw new Error(
    `EXPO_PUBLIC_API_URL is required when APP_ENV=${APP_ENV}.`
  );
}

const variant = variants[APP_ENV];
const resolvedApiUrl = API_URL || DEFAULT_DEV_API_URL;

module.exports = ({ config }) => ({
  ...baseConfig,
  ...config,
  name: variant.appName,
  slug: variant.slug,
  ios: {
    ...baseConfig.ios,
    ...config.ios,
    bundleIdentifier: variant.iosBundleIdentifier,
  },
  android: {
    ...baseConfig.android,
    ...config.android,
    package: variant.androidPackage,
  },
  extra: {
    ...baseConfig.extra,
    ...config.extra,
    appEnv: APP_ENV,
    apiUrl: resolvedApiUrl,
  },
});
