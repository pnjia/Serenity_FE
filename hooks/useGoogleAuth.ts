import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const googleClientConfig = {
  clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
};

const hasAnyClientId = Object.values(googleClientConfig).some((value) =>
  Boolean(value && value.length > 0)
);

const APP_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME || "serenity";
const shouldUseProxy = process.env.EXPO_PUBLIC_USE_EXPO_AUTH_PROXY === "true";

export const useGoogleAuth = () => {
  const nativeRedirect = useMemo(
    () =>
      makeRedirectUri({
        scheme: APP_SCHEME,
        path: "oauthredirect",
        preferLocalhost: true,
      }),
    []
  );

  const resolvedRedirectUri = useMemo(() => {
    if (shouldUseProxy) {
      return undefined;
    }

    if (Platform.OS === "web") {
      // For web, use current origin with /auth/google/callback path
      if (typeof window !== "undefined") {
        return `${window.location.origin}/auth/google/callback`;
      }
      return "http://localhost:8081/auth/google/callback";
    }

    return nativeRedirect;
  }, [nativeRedirect]);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    ...googleClientConfig,
    scopes: ["profile", "email"],
    selectAccount: true,
    redirectUri: resolvedRedirectUri,
  });

  console.log("[useGoogleAuth] Configuration:");
  console.log("  - Platform:", Platform.OS);
  console.log(
    "  - Client ID:",
    googleClientConfig.clientId?.substring(0, 20) + "..."
  );
  console.log(
    "  - Android Client ID:",
    googleClientConfig.androidClientId?.substring(0, 20) + "..."
  );
  console.log(
    "  - iOS Client ID:",
    googleClientConfig.iosClientId?.substring(0, 20) + "..."
  );
  console.log("  - Redirect URI:", resolvedRedirectUri);
  console.log("  - Use Proxy:", shouldUseProxy);

  const getIdToken = useCallback(async () => {
    if (!hasAnyClientId) {
      throw new Error(
        "Google Client ID belum dikonfigurasi. Setel variabel EXPO_PUBLIC_GOOGLE_* terlebih dahulu."
      );
    }

    console.log("[useGoogleAuth] Prompting for Google authentication...");
    console.log("[useGoogleAuth] Platform:", Platform.OS);
    console.log("[useGoogleAuth] Redirect URI:", resolvedRedirectUri);

    const result = await promptAsync();

    console.log("[useGoogleAuth] Result type:", result.type);
    console.log(
      "[useGoogleAuth] Full result:",
      JSON.stringify(result, null, 2)
    );

    // Handle success
    if (result.type === "success") {
      if (result.params?.id_token) {
        console.log("[useGoogleAuth] Successfully got ID token");
        return result.params.id_token;
      }

      // Sometimes token is in authentication object
      if ((result as any).authentication?.idToken) {
        console.log(
          "[useGoogleAuth] Successfully got ID token from authentication"
        );
        return (result as any).authentication.idToken;
      }

      console.error("[useGoogleAuth] Success but no token found");
    }

    // Handle explicit dismiss
    if (result.type === "dismiss" || result.type === "cancel") {
      console.log("[useGoogleAuth] User cancelled authentication");
      throw new Error("Login Google dibatalkan oleh pengguna.");
    }

    // Handle error
    if (result.type === "error") {
      console.error("[useGoogleAuth] Error result:", result);
      const errorMsg =
        (result as any).error?.message || "Terjadi kesalahan saat login Google";
      throw new Error(errorMsg);
    }

    // Unknown result type
    console.error("[useGoogleAuth] Unknown result type or missing token");
    throw new Error(
      "Tidak dapat mengambil token Google. Pastikan konfigurasi Client ID sudah benar."
    );
  }, [promptAsync, resolvedRedirectUri]);

  return {
    isReady: hasAnyClientId && !!request,
    getIdToken,
  };
};
