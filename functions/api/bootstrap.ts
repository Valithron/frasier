interface Env { DB: D1Database }
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const result = await env.DB.prepare("SELECT * FROM frasier_quotes WHERE deleted_at IS NULL ORDER BY created_at DESC").all();
  const quotes = result.results.map((row) => ({
    id: row.id, body: row.body, speakers: JSON.parse(String(row.speakers || "[]")),
    season: row.season, episode: row.episode, title: row.title,
    favorite: Boolean(row.favorite), queued: Boolean(row.queued),
    postedAt: row.posted_at, notes: row.notes, createdAt: row.created_at,
    updatedAt: row.updated_at, revision: row.revision, deviceId: row.device_id
  }));
  return Response.json({ schemaVersion: 1, quotes });
};
