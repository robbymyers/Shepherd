export type EventKind = "run" | "workout" | "walk";

export interface SportEvent {
  id: string;
  source: "strava" | "manual";
  kind: EventKind;
  name: string;
  date: string; // ISO 8601
  description?: string | null;
  location?: string | null;
  gear?: string | null;
  movingTime?: string | null; // "MM:SS" / "H:MM:SS"
  movingSeconds?: number | null;
  distance?: number | null; // miles
  elevationGain?: number | null; // feet
  calories?: number | null;
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
  pace?: string | null; // "9:59/mi"
}

export interface MovementSession {
  date: string; // YYYY-MM-DD
  weight: number | null;
  reps?: string | null;
  sets?: string | null;
  notes?: string | null;
  oneRepMax?: boolean;
}

export interface Movement {
  id: string;
  name: string;
  best: number | null;
  bestDate: string | null;
  sessions: MovementSession[];
}

export interface WodScore {
  date: string; // YYYY-MM-DD
  score: string;
  scoreType: string;
  pr: boolean;
  rx: boolean;
  notes?: string | null;
}

export interface Wod {
  id: string;
  title: string;
  type: string;
  category: "hero" | "benchmark";
  description?: string | null;
  weight?: string | null;
  logged: boolean;
  scores: WodScore[];
}

export interface Vo2Point {
  date: string;
  value: number;
}

export interface Highlight {
  label: string;
  value?: string;
  time?: string;
  date: string;
  kind?: "wod" | "lift";
}

export interface Athlete {
  name: string;
  box: string;
  location: string;
  loggedEvents: number;
}

export interface SeedData {
  athlete: Athlete;
  events: SportEvent[];
  movements: Movement[];
  wods: Wod[];
  vo2max: Vo2Point[];
  runHighlights: Highlight[];
  prHighlights: Highlight[];
}

export type ProgressCardId = "vo2" | "pr" | "runs";
