import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";

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

export const useGoogleAuth = () => {
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    ...googleClientConfig,
    scopes: ["profile", "email"],
    selectAccount: true,
  });

  const getIdToken = useCallback(async () => {
    if (!hasAnyClientId) {
      throw new Error(
        "Google Client ID belum dikonfigurasi. Setel variabel EXPO_PUBLIC_GOOGLE_* terlebih dahulu."
      );
    }

    const result = await promptAsync();

    if (result.type !== "success" || !result.params?.id_token) {
      if (result.type === "dismiss") {
        throw new Error("Login Google dibatalkan oleh pengguna.");
      }

      throw new Error("Tidak dapat mengambil token Google. Coba lagi.");
    }

    return result.params.id_token;
  }, [promptAsync]);

  return {
    isReady: hasAnyClientId && !!request,
    getIdToken,
  };
};
