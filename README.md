# Spotify App Remote (reloaded) for React Native

[![npm version](https://badge.fury.io/js/react-native-spotify-remote.svg)](https://badge.fury.io/js/react-native-spotify-remote)

[![Spotify iOS SDK Version](https://img.shields.io/badge/Spotify%20iOS%20SDK-v1.2.2-brightgreen)](https://github.com/spotify/ios-sdk/commit/f9a7d53967de5ea633845c2387b7fc8f90b96265)

[![Spotify Android App Remote Version](https://img.shields.io/badge/Spotify%20Android%20App%20Remote%20SDK-v0.7.2-brightgreen)](https://github.com/spotify/android-sdk/commit/cfd6b68a47440a7db8afac1983d92d324a1c0015)

[![Spotify Android Auth Version](https://img.shields.io/badge/Spotify%20Android%20Auth%20SDK-v1.2.3-brightgreen)](https://github.com/spotify/android-sdk/commit/cfd6b68a47440a7db8afac1983d92d324a1c0015)

A react native module for the Spotify Remote SDK ( [iOS](https://github.com/spotify/ios-sdk/) | [Android](https://github.com/spotify/android-sdk/) )

- [Documentation](https://cjam.github.io/react-native-spotify-remote/index.html)
- [Change Log](./CHANGELOG.md)
- [Contributing](./CONTRIBUTING.md)

## Supported Features

An [Example](./example) project was developed to exercise and test all functionality within this library. If you are curious about how to use something, or need to compare your application setup to something that works, check there first.

## Features

See official docs:
- for [android](https://developer.spotify.com/documentation/android)
- for [ios](https://developer.spotify.com/documentation/ios)

## Install

```bash
yarn add react-native-spotify-remote
```

or

```bash
npm install --save react-native-spotify-remote-reloaded
```

> **Android 11 and Above**
>
> Add the following to your Android Manifest:
>
> `<queries> <package android:name="com.spotify.music" /> </queries>`

## Linking

As of React Native `> 0.61`, auto linking should work for both iOS and Android. There shouldn't be any modifications necessary and it _Should_ work out of the box. If you do run into issues or are using an older version of React Native, the following sections should help get you up and running.

### iOS

> This library requires being built with **XCode 11** for reasons given [here](https://github.com/spotify/ios-sdk/issues/179#issuecomment-581032275).

#### Cocoapods (Recommended)

By far the easiest way to integrate into your project. In your `ios/PodFile` add the following lines to your projects target:

```rb
    pod 'RNSpotifyRemote', :path => '../node_modules/react-native-spotify-remote'
```

See the [`Example App PodFile`](./example/ios/PodFile) for a full example.

I have only tested this against RN > 0.60 in the example app. So if you have issues with a RN version < 0.60 that might be a place to start troubleshooting.

#### Manual

Manual linking is needed for projects that don't use Cocoapods.

1. Manually add the frameworks from `node_modules/react-native-spotify-remote/ios/external/SpotifySDK` to _Linked Frameworks and Libraries_ in your project settings.

![iOS Framework Search paths](.screenshots/ios-add-framework.png);

2. Then add `../node_modules/react-native-spotify-remote/ios/external/SpotifySDK` to _Framework Search Paths_ in your project settings see the screenshot below. (By default it won't show the options in XCode so you may need to check `all`)

![iOS Framework Search paths](.screenshots/ios-framework-searchpaths.png);

##### Troubleshooting

`'React/RCTConvert.h' file not found` might be due to a build dependency issue where `RNSpotifyRemote` is being built _before_ `React`. Try adding `React` as an explicit dependency of the `RNSpotifyRemote` target/project in XCode. Otherwise, Cocoapods should solve this for you.

## Auth Callback

In order to support the callback that you will get from the Spotify App you will need to add a url handler to your app.

### iOS

Modifications are needed for the `AppDelegate.m`:

```objective-c
#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <RNSpotifyRemote.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)URL options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
  return [[RNSpotifyRemoteAuth sharedInstance] application:application openURL:URL options:options];
}

@end
```

### Android

If you need to link your project manually, here are some things you'll need to do.

1. Open up `android/app/src/main/java/[...]/MainApplication.java`

- Add the following imports to the top of the file

```
import com.reactlibrary.RNSpotifyRemotePackage;
```

- Add to the list returned by `getPackages()` for example:

```java
      @Override
      protected List<ReactPackage> getPackages() {
        @SuppressWarnings("UnnecessaryLocalVariable")
        List<ReactPackage> packages = new PackageList(this).getPackages();
        // Packages that cannot be autolinked yet can be added manually here, for example:
           packages.add(new RNSpotifyRemotePackage());
        return packages;
      }
```

2. Append the following lines to `android/settings.gradle`:

   ```
   include ':react-native-spotify-remote'
   project(':react-native-spotify-remote').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-spotify-remote/android')
   ```

3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
   ```
   implementation project(':react-native-spotify-remote')
   ```
4. As per the [Spotify Android SDK Docs](https://developer.spotify.com/documentation/android/guides/android-authentication/) Insert the following lines into `android/app/src/AndroidManifest.xml`

```xml
      <activity
            android:exported="true"
            android:name="com.spotify.sdk.android.authentication.AuthCallbackActivity"
            android:theme="@android:style/Theme.Translucent.NoTitleBar">

            <intent-filter>
                <action android:name="android.intent.action.VIEW"/>
                <category android:name="android.intent.category.DEFAULT"/>
                <category android:name="android.intent.category.BROWSABLE"/>

                <data
                    android:scheme="<YOUR_APPLICATION_SCHEME>"
                    android:host="<YOUR_APPLICATION_CALLBACK>"/>
            </intent-filter>
        </activity>

        <activity
            android:name="com.spotify.sdk.android.authentication.LoginActivity"
            android:theme="@android:style/Theme.Translucent.NoTitleBar">
        </activity>
```

If you have issues linking the module, please check that gradle is updated to the latest version and that your project is synced.

## Usage

### Example Application

This repo contains an [Example App](./example/Readme.md) which should be the quickest and easiest way to get up and running to try things out. It is using React Hooks (cuz they're pretty cool) and exercises all of the remote API calls.

### In Code

Again, I recommend looking at the example app. If you specifically want to see some code that actually does stuff take a look at the [App.tsx](./example/App.tsx).

Here's how you would use this library with Typescript (though the same mostly applies to Javascript) and the `async`/`await` syntax for promises (Just cuz I like em).

```typescript
import {
  auth as SpotifyAuth,
  remote as SpotifyRemote,
  ApiScope,
  ApiConfig,
} from "react-native-spotify-remote";

// Api Config object, replace with your own applications client id and urls
const spotifyConfig: ApiConfig = {
  clientID: "SPOTIFY_CLIENT_ID",
  redirectURL: "SPOTIFY_REDIRECT_URL",
  tokenRefreshURL: "SPOTIFY_TOKEN_REFRESH_URL",
  tokenSwapURL: "SPOTIFY_TOKEN_SWAP_URL",
  scopes: [ApiScope.AppRemoteControlScope, ApiScope.UserFollowReadScope],
};

// Initialize the library and connect the Remote
// then play an epic song
async function playEpicSong() {
  try {
    const session = await SpotifyAuth.authorize(spotifyConfig);
    await SpotifyRemote.connect(session.accessToken);
    await SpotifyRemote.playUri("spotify:track:6IA8E2Q5ttcpbuahIejO74");
    await SpotifyRemote.seek(58000);
  } catch (err) {
    console.error("Couldn't authorize with or connect to Spotify", err);
  }
}
```

## Token Swap & Refresh

> A server must be running for with endpoints that allow Spotify to authenticate your app.

In order to support the OAuth flow, you need to have a server to support the calls for token `swap` and `refresh`. I have included the same server setup defined in the [react-native-spotify](https://github.com/lufinkey/react-native-spotify#token-swap-and-refresh) repo as it does exactly what you need.

See the [Server Readme](./example-server/README.md) for further instructions.

## Additional notes

Nothing has been special to deal with Spotify _Free_ Users but this module _should_ still work.

## Opening Issues

Please do not open issues about getting the module to work unless you have tried using both the example app and the example token swap server. Please make sure you have tried running on the latest react-native version before submitting a bug.

## Contributors

Big thanks co cjam orginall author of [https://github.com/cjam/react-native-spotify-remote]
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Projects using this library

Checkout existing [Projects](./PROJECTS.md) that are using this library.
