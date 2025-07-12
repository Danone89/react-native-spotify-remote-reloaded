// expo-config-spotify-remote-plugin.js
const { withAppBuildGradle, withPlugins, withAndroidManifest, withInfoPlist, createRunOncePlugin } = require('@expo/config-plugins');

/**
 * Add Android manifest placeholders for Spotify SDK authentication
 */
const withAndroidSpotifyManifest = (config, options = {}) => {
  const redirectSchemeName = options.redirectSchemeName || "spotify-sdk";
  const redirectHostName = options.redirectHostName || "auth";

  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;

      // Check if the manifest placeholders are already set
      if (buildGradle.includes('manifestPlaceholders = [redirectSchemeName:')) {
        return config;
      }

      // Add the manifest placeholders in the defaultConfig section
      const pattern = /defaultConfig\s*{[^}]*}/s;
      const match = buildGradle.match(pattern);

      if (match) {
        const defaultConfigBlock = match[0];
        const updatedBlock = defaultConfigBlock.replace(
          /defaultConfig\s*{/,
          `defaultConfig {\n        manifestPlaceholders = [redirectSchemeName: "${redirectSchemeName}", redirectHostName: "${redirectHostName}"]`
        );

        config.modResults.contents = buildGradle.replace(defaultConfigBlock, updatedBlock);
      }
    }

    return config;
  });
};

/**
 * Add Spotify URL scheme to Android manifest
 */
const withAndroidSpotifyUrlScheme = (config, options = {}) => {
  return withAndroidManifest(config, async (config) => {
    const redirectSchemeName = options.redirectSchemeName || "spotify-sdk";
    const mainApplication = getMainApplication(config.modResults);

    // Check if we already have the activity
    if (mainApplication.activity && mainApplication.activity.some(activity =>
      activity.$['android:name'] === 'com.spotify.sdk.android.authentication.AuthCallbackActivity')) {
      return config;
    }

    // Add the authentication callback activity
    if (!mainApplication.activity) {
      mainApplication.activity = [];
    }

    mainApplication.activity.push({
      $: {
        'android:name': 'com.spotify.sdk.android.authentication.AuthCallbackActivity',
        'android:exported': 'true',
        'android:theme': '@android:style/Theme.Translucent.NoTitleBar'
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          category: [
            { $: { 'android:name': 'android.intent.category.DEFAULT' } },
            { $: { 'android:name': 'android.intent.category.BROWSABLE' } }
          ],
          data: [
            {
              $: {
                'android:scheme': `${redirectSchemeName}`,
                'android:host': `${redirectHostName}`
              }
            }
          ]
        }
      ]
    });

    return config;
  });
};

/**
 * Add LSApplicationQueriesSchemes for Spotify to iOS Info.plist
 */
const withIosSpotifyScheme = (config, options = {}) => {
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Add LSApplicationQueriesSchemes for Spotify if it doesn't exist
    if (!infoPlist.LSApplicationQueriesSchemes) {
      infoPlist.LSApplicationQueriesSchemes = [];
    }

    if (!infoPlist.LSApplicationQueriesSchemes.includes('spotify')) {
      infoPlist.LSApplicationQueriesSchemes.push('spotify');
    }

    return config;
  });
};

/**
 * Helper function to get the main application from Android manifest
 */
function getMainApplication(manifest) {
  if (manifest.application && Array.isArray(manifest.application)) {
    return manifest.application[0];
  } else if (manifest.application) {
    return manifest.application;
  }

  manifest.application = {};
  return manifest.application;
}

/**
 * Main plugin function that combines all modifications
 */
const withSpotifyRemote = (config, options = {}) => {
  return withPlugins(config, [
    [withAndroidSpotifyManifest, options],
    [withAndroidSpotifyUrlScheme, options],
    [withIosSpotifyScheme, options]
  ]);
};

module.exports = createRunOncePlugin(
  withSpotifyRemote,
  'react-native-spotify-remote',
  '1.0.0' // Minimum compatible version of the package
);
