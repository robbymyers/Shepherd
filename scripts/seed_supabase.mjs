#!/usr/bin/env node
/**
 * One-off seed: load app-web/public/data/seed.json into Supabase.
 * Uses the service-role key (bypasses RLS) from app-web/.env.local.
 *
 *   node scripts/seed_supabase.mjs
 *
 * Idempotent: upserts by primary key, so re-running is safe. Run extract.py
 * first if seed.json is stale.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const APP = join(here, "..", "app-web");
// @supabase/supabase-js lives in app-web/node_modules
const require = createRequire(join(APP, "package.json"));
const { createClient } = require("@supabase/supabase-js");

// load .env.local without a dependency
const env = {};
for (const raw of readFileSync(join(APP, ".env.local"), "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 1) continue;
  const k = line.slice(0, eq).trim();
  let v = line.slice(eq + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  env[k] = v;
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in app-web/.env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const seed = JSON.parse(readFileSync(join(APP, "public", "data", "seed.json"), "utf8"));

async function upsert(table, rows, conflict) {
  if (!rows.length) return;
  // chunk to keep payloads reasonable (routes can be large)
  const SIZE = 200;
  for (let i = 0; i < rows.length; i += SIZE) {
    const chunk = rows.slice(i, i + SIZE);
    const { error } = await db.from(table).upsert(chunk, { onConflict: conflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  console.log(`  ${table}: ${rows.length}`);
}

const events = seed.events.map((e) => ({
  id: e.id,
  kind: e.kind,
  source: e.source ?? "manual",
  name: e.name,
  date: e.date,
  description: e.description ?? null,
  location: e.location ?? null,
  gear: e.gear ?? null,
  moving_time: e.movingTime ?? null,
  moving_seconds: e.movingSeconds ?? null,
  distance: e.distance ?? null,
  elevation_gain: e.elevationGain ?? null,
  calories: e.calories ?? null,
  avg_heart_rate: e.avgHeartRate ?? null,
  max_heart_rate: e.maxHeartRate ?? null,
  pace: e.pace ?? null,
  score_type: e.scoreType ?? null,
  score: e.score ?? null,
  pr: e.pr ?? null,
  rx: e.rx ?? null,
  route: e.route ?? null,
  splits: e.splits ?? null,
}));

const movements = seed.movements.map((m) => ({ id: m.id, name: m.name }));
const sessions = seed.movements.flatMap((m) =>
  m.sessions.map((s) => ({
    movement_id: m.id,
    date: s.date,
    weight: s.weight ?? null,
    reps: s.reps ?? null,
    sets: s.sets ?? null,
    notes: s.notes ?? null,
    one_rep_max: s.oneRepMax ?? false,
  }))
);

const wods = seed.wods.map((w) => ({
  id: w.id,
  title: w.title,
  type: w.type ?? null,
  category: w.category ?? null,
  description: w.description ?? null,
  weight: w.weight ?? null,
}));
const scores = seed.wods.flatMap((w) =>
  w.scores.map((s) => ({
    wod_id: w.id,
    date: s.date,
    score: s.score ?? null,
    score_type: s.scoreType ?? null,
    pr: s.pr ?? false,
    rx: s.rx ?? false,
    notes: s.notes ?? null,
  }))
);

console.log("Seeding Supabase…");
// reference rows first (sessions/scores have FKs)
await upsert("events", events, "id");
await upsert("movements", movements, "id");
await upsert("wods", wods, "id");
// sessions/scores have surrogate uuid PKs — clear then insert to stay idempotent
for (const t of ["movement_sessions", "wod_scores"]) {
  const { error } = await db.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(`clear ${t}: ${error.message}`);
}
await upsert("movement_sessions", sessions, undefined);
await upsert("wod_scores", scores, undefined);
console.log("Done.");
