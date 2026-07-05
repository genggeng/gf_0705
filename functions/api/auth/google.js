import { badRequest, json, sessionCookie, signSession, verifyGoogleIdToken } from "./_utils.js";

export async function onRequestPost({ request, env }) {
  const googleClientId = env.GOOGLE_CLIENT_ID;
  const sessionSecret = env.SESSION_SECRET;
  if (!googleClientId || !sessionSecret) {
    return json({ error: "Auth is not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return badRequest("Invalid JSON");
  }

  const user = await verifyGoogleIdToken(body.credential, googleClientId);
  if (!user) return json({ error: "Invalid Google credential" }, { status: 401 });

  const session = await signSession(user, sessionSecret);
  return json({ user }, { headers: { "Set-Cookie": sessionCookie(session) } });
}
