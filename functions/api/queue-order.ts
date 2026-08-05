interface Env {
  DB: D1Database;
}

const ensureTable = (env: Env) =>
  env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS frasier_queue_order (
    id INTEGER PRIMARY KEY,
    ordered_ids TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  ).run();

const headers = { "Cache-Control": "no-store" };

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  await ensureTable(env);
  const row = await env.DB.prepare(
    "SELECT ordered_ids FROM frasier_queue_order WHERE id = 1",
  ).first<{ ordered_ids: string }>();
  let order: string[] = [];
  try {
    const parsed = JSON.parse(row?.ordered_ids || "[]");
    if (Array.isArray(parsed)) order = parsed.map(String);
  } catch {
    order = [];
  }
  return Response.json({ order }, { headers });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "origin rejected" }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 100_000)
    return Response.json({ error: "order too large" }, { status: 413 });
  let data: { order?: unknown };
  try {
    data = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  if (!Array.isArray(data.order) || data.order.length > 1_000)
    return Response.json({ error: "invalid order" }, { status: 400 });
  const order = [...new Set(data.order.map(String).filter(Boolean))];
  if (order.some((id) => id.length > 100))
    return Response.json({ error: "invalid id" }, { status: 400 });
  await ensureTable(env);
  await env.DB.prepare(
    `INSERT INTO frasier_queue_order (id, ordered_ids, updated_at)
     VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       ordered_ids = excluded.ordered_ids,
       updated_at = excluded.updated_at`,
  )
    .bind(JSON.stringify(order), new Date().toISOString())
    .run();
  return Response.json({ saved: true, order }, { headers });
};
