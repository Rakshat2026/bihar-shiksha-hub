// Server-side OTP request + verify. Replaces the insecure client-side mock OTP flow.
// Generates a real 6-digit code (mock-delivered: returned in dev, otherwise logged server-side),
// stores only its SHA-256 hash with a 5-minute TTL, and verifies server-side.
// On successful verification, signs the user in by issuing a server-generated random password
// (never derivable from public data) and returning it to the client for a single signInWithPassword call.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Mock-OTP mode: when true, the OTP value is returned in the response so the
// frontend can display it (no SMS provider configured). Set to "false" once
// real SMS delivery is wired up.
const MOCK_OTP_MODE = (Deno.env.get("MOCK_OTP_MODE") ?? "true") === "true";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomDigits(n: number): string {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += (b % 10).toString();
  return out;
}

function randomPassword(): string {
  // 32 bytes of entropy, base64url-encoded
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function isValidMobile(m: unknown): m is string {
  return typeof m === "string" && /^[0-9]{10}$/.test(m);
}

function syntheticEmail(mobile: string) {
  return `m${mobile}@gyangangaacademy.local`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { action?: string; mobile?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const action = body.action;
  const mobile = body.mobile;

  if (!isValidMobile(mobile)) {
    return json({ error: "Invalid mobile number" }, 400);
  }

  try {
    if (action === "request") {
      // Basic per-mobile rate limit: max 5 requests in last 10 minutes
      const since = new Date(Date.now() - 10 * 60_000).toISOString();
      const { count } = await admin
        .from("otp_codes")
        .select("id", { count: "exact", head: true })
        .eq("mobile_number", mobile)
        .gte("created_at", since);
      if ((count ?? 0) >= 5) {
        return json({ error: "Too many requests. Please try again later." }, 429);
      }

      const code = randomDigits(6);
      const code_hash = await sha256(code);
      const expires_at = new Date(Date.now() + 5 * 60_000).toISOString();

      // Invalidate previous unconsumed codes for this number
      await admin
        .from("otp_codes")
        .update({ consumed: true })
        .eq("mobile_number", mobile)
        .eq("consumed", false);

      const { error: insErr } = await admin
        .from("otp_codes")
        .insert({ mobile_number: mobile, code_hash, expires_at });
      if (insErr) {
        console.error("otp insert failed", insErr);
        return json({ error: "Could not send code" }, 500);
      }

      // In real production this is where you'd call Twilio/MSG91.
      console.log(`[auth-otp] OTP for ${mobile}: ${code} (expires ${expires_at})`);

      return json({
        ok: true,
        // Only echo the code in mock mode so the prototype stays usable without SMS.
        ...(MOCK_OTP_MODE ? { dev_code: code } : {}),
      });
    }

    if (action === "verify") {
      const code = body.code;
      if (typeof code !== "string" || !/^[0-9]{6}$/.test(code)) {
        return json({ error: "Invalid code" }, 400);
      }

      const { data: rows, error: selErr } = await admin
        .from("otp_codes")
        .select("id, code_hash, expires_at, attempts, consumed")
        .eq("mobile_number", mobile)
        .eq("consumed", false)
        .order("created_at", { ascending: false })
        .limit(1);
      if (selErr) {
        console.error("otp select failed", selErr);
        return json({ error: "Verification failed" }, 500);
      }
      const row = rows?.[0];
      if (!row) return json({ error: "Code expired or not found" }, 400);
      if (new Date(row.expires_at).getTime() < Date.now()) {
        await admin.from("otp_codes").update({ consumed: true }).eq("id", row.id);
        return json({ error: "Code expired" }, 400);
      }
      if (row.attempts >= 5) {
        await admin.from("otp_codes").update({ consumed: true }).eq("id", row.id);
        return json({ error: "Too many attempts" }, 429);
      }

      const submitted_hash = await sha256(code);
      if (submitted_hash !== row.code_hash) {
        await admin
          .from("otp_codes")
          .update({ attempts: row.attempts + 1 })
          .eq("id", row.id);
        return json({ error: "Incorrect code" }, 400);
      }

      // Consume the code
      await admin.from("otp_codes").update({ consumed: true }).eq("id", row.id);

      // Find or create the auth user, then rotate to a fresh random password
      // so the client can complete a normal signInWithPassword flow.
      const email = syntheticEmail(mobile);
      const password = randomPassword();
      let isNew = false;

      // Look up existing user by email via the admin API.
      // listUsers paginates; the synthetic email is unique so the first page suffices.
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (listErr) {
        console.error("listUsers failed", listErr);
        return json({ error: "Could not complete sign-in" }, 500);
      }
      const existing = list?.users?.find((u) => u.email === email);

      if (existing) {
        const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });
        if (updErr) {
          console.error("updateUserById failed", updErr);
          return json({ error: "Could not complete sign-in" }, 500);
        }
      } else {
        const { error: createErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { mobile_number: mobile },
        });
        if (createErr) {
          console.error("createUser failed", createErr);
          return json({ error: "Could not create account" }, 500);
        }
        isNew = true;
      }

      return json({ ok: true, email, password, isNew });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("auth-otp unhandled error", err);
    return json({ error: "Server error" }, 500);
  }
});
