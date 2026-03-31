export type OAuthProvider = "google" | "facebook" | "apple";

export type OAuthPayload = {
  idToken?: string;
  accessToken?: string;
  name?: string;
};

declare global {
  interface Window {
    google?: any;
    FB?: any;
    AppleID?: any;
    fbAsyncInit?: () => void;
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-services";
const FACEBOOK_SCRIPT_ID = "facebook-jssdk";
const APPLE_SCRIPT_ID = "apple-signin-sdk";

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`${name} is missing. Add it to frontend env config.`);
  }
  return value;
}

export async function startGoogleOAuth(): Promise<OAuthPayload> {
  const clientId = requireEnv("VITE_GOOGLE_CLIENT_ID", import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined);
  await loadScript("https://accounts.google.com/gsi/client", GOOGLE_SCRIPT_ID);

  return new Promise<OAuthPayload>((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google SDK not available."));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response: { access_token?: string; error?: string }) => {
        if (response?.error || !response?.access_token) {
          reject(new Error("Google authorization failed."));
          return;
        }
        resolve({ accessToken: response.access_token });
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

export async function startFacebookOAuth(): Promise<OAuthPayload> {
  const appId = requireEnv("VITE_FACEBOOK_APP_ID", import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined);
  await loadScript("https://connect.facebook.net/en_US/sdk.js", FACEBOOK_SCRIPT_ID);

  return new Promise<OAuthPayload>((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v20.0",
      });

      window.FB.login(
        (response: { authResponse?: { accessToken?: string } }) => {
          const accessToken = response?.authResponse?.accessToken;
          if (!accessToken) {
            reject(new Error("Facebook authorization cancelled."));
            return;
          }
          resolve({ accessToken });
        },
        { scope: "public_profile,email" }
      );
    };

    if (window.FB) {
      window.fbAsyncInit();
    }
  });
}

export async function startAppleOAuth(): Promise<OAuthPayload> {
  const clientId = requireEnv("VITE_APPLE_CLIENT_ID", import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined);
  const redirectUri = requireEnv("VITE_APPLE_REDIRECT_URI", import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined);

  await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", APPLE_SCRIPT_ID);

  if (!window.AppleID?.auth) {
    throw new Error("Apple SDK not available.");
  }

  window.AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI: redirectUri,
    usePopup: true,
  });

  const response = await window.AppleID.auth.signIn();
  const idToken = response?.authorization?.id_token;
  const givenName = response?.user?.name?.firstName;
  const familyName = response?.user?.name?.lastName;
  const name = [givenName, familyName].filter(Boolean).join(" ").trim();

  if (!idToken) {
    throw new Error("Apple authorization failed.");
  }

  return { idToken, name: name || undefined };
}

export async function startOAuth(provider: OAuthProvider): Promise<OAuthPayload> {
  if (provider === "google") return startGoogleOAuth();
  if (provider === "facebook") return startFacebookOAuth();
  return startAppleOAuth();
}
