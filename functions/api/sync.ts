interface Env { DB: D1Database }
type Incoming = { id:string; body:string; speakers?:string[]; season?:number; episode?:number; title?:string; favorite?:boolean; queued?:boolean; postedAt?:string; notes?:string; createdAt?:string; updatedAt?:string; revision?:number; deviceId?:string };

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "origin rejected" }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 250_000) return Response.json({ error: "batch too large" }, { status: 413 });
  let data: { changes?: Incoming[] };
  try { data = JSON.parse(raw); } catch { return Response.json({ error: "invalid json" }, { status: 400 }); }
  const changes = Array.isArray(data.changes) ? data.changes.slice(0, 100) : [];
  const accepted: string[] = [];
  for (const q of changes) {
    if (!q.id || typeof q.body !== "string" || q.body.length > 20_000) continue;
    await env.DB.prepare(`INSERT INTO frasier_quotes (id,body,speakers,season,episode,title,favorite,queued,posted_at,notes,created_at,updated_at,deleted_at,revision,device_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET body=excluded.body,speakers=excluded.speakers,season=excluded.season,episode=excluded.episode,title=excluded.title,favorite=excluded.favorite,queued=excluded.queued,posted_at=excluded.posted_at,notes=excluded.notes,updated_at=excluded.updated_at,revision=excluded.revision,device_id=excluded.device_id
      WHERE excluded.revision >= frasier_quotes.revision`)
      .bind(q.id,q.body,JSON.stringify(q.speakers||[]),q.season||1,q.episode||1,q.title||"",q.favorite?1:0,q.queued?1:0,q.postedAt||null,q.notes||null,q.createdAt||new Date().toISOString(),q.updatedAt||new Date().toISOString(),null,q.revision||1,q.deviceId||null).run();
    accepted.push(q.id);
  }
  return Response.json({ accepted, rejected: [], cursor: new Date().toISOString() });
};
