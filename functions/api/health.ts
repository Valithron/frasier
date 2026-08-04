interface Env { DB: D1Database }
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    await env.DB.prepare("SELECT 1 AS ok").first();
    return Response.json({ status: "ok", database: "connected", schemaVersion: 1 });
  } catch {
    return Response.json({ status: "degraded", database: "unavailable", schemaVersion: 1 }, { status: 503 });
  }
};
