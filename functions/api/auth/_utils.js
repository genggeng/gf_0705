const textEncoder = new TextEncoder();
const sessionCookieName = "ica_session";

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {})
    }
  });
}

export function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

export async function verifyGoogleIdToken(token, clientId) {
  if (!token || !clientId) return null;
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
  if (!res.ok) return null;
  const payload = await res.json();
  if (payload.aud !== clientId) return null;
  if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") return null;
  if (Number(payload.exp || 0) * 1000 < Date.now()) return null;
  if (!payload.sub || !payload.email) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture || ""
  };
}

export async function signSession(user, secret) {
  const payload = base64UrlEncode(JSON.stringify({
    user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  }));
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

export async function readSession(request, secret) {
  const cookie = request.headers.get("Cookie") || "";
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`))
    ?.slice(sessionCookieName.length + 1);
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = await hmac(payload, secret);
  if (signature !== expected) return null;
  const data = JSON.parse(base64UrlDecode(payload));
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
  return data.user || null;
}

export function sessionCookie(value) {
  return `${sessionCookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
}

export function clearSessionCookie() {
  return `${sessionCookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function base64UrlEncode(value) {
  return base64UrlEncodeBytes(textEncoder.encode(value));
}

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
