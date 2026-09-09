import type { ExpoConfig } from "expo/config";

// GoogleのiOSクライアントID（`xxxx.apps.googleusercontent.com`）から、
// アプリのURL Schemeとして使う逆順形式（`com.googleusercontent.apps.xxxx`）を組み立てる
function toGoogleIosUrlScheme(clientId: string | undefined): string | undefined {
  if (!clientId) return undefined;
  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/, "");
  return `com.googleusercontent.apps.${prefix}`;
}

const config: ExpoConfig = {
  name: "Tremane",
  slug: "Tremane",
  version: "1.0.4",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "tremane",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.chibitaka0320.Tremane",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-sqlite",
    "expo-font",
    "expo-web-browser",
    "@react-native-community/datetimepicker",
    "expo-image",
    "expo-status-bar",
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: toGoogleIosUrlScheme(
          process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        ),
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "802f95ee-18e0-48e9-b71f-270c6b145308",
    },
  },
};

export default config;
