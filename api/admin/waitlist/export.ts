import { createClient } from "@supabase/supabase-js";

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (payload: unknown) => void;
  send: (body: string) => void;
  setHeader: (name: string, value: string) => void;
};

type WaitlistRow = {
  email: string;
  source: string | null;
  joined_at: string | null;
};

function toCsvValue(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }
  return value;
}

function buildCsv(rows: WaitlistRow[]): string {
  const header = "email,source,joined_at";
  const body = rows.map((row) => [
    toCsvValue(row.email ?? ""),
    toCsvValue(row.source ?? ""),
    toCsvValue(row.joined_at ?? ""),
  ].join(","));
  return [header, ...body].join("\n");
}

function isAdminEmail(email: string | undefined): boolean {
  return email?.toLowerCase().endsWith("@visiontech.ai") ?? false;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    res.status(500).json({ error: "Missing Supabase environment configuration." });
    return;
  }

  const rawAuthHeader = req.headers.authorization;
  const authHeader = Array.isArray(rawAuthHeader) ? rawAuthHeader[0] : rawAuthHeader;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing authorization token." });
    return;
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  if (!isAdminEmail(authData.user.email)) {
    res.status(403).json({ error: "Forbidden." });
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await adminClient
    .from("waitlist_signups")
    .select("email, source, joined_at")
    .order("joined_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: "Failed to load waitlist records." });
    return;
  }

  const csv = buildCsv((data ?? []) as WaitlistRow[]);
  const timestamp = new Date().toISOString().slice(0, 10);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="waitlist-${timestamp}.csv"`);
  res.status(200).send(csv);
}
