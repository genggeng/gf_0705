import { json, readSession } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  if (!env.SESSION_SECRET) return json({ user: null });
  const user = await readSession(request, env.SESSION_SECRET).catch(() => null);
  return json({ user });
}
