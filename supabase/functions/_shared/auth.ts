import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export { z };

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting store (resets on function cold start)
// For production, consider using Redis or database-backed rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const checkRateLimit = (userId: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } => {
  const now = Date.now();
  const key = userId;
  
  let record = rateLimitStore.get(key);
  
  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  if (!record || record.resetAt < now) {
    // New window
    record = { count: 1, resetAt: now + config.windowMs };
    rateLimitStore.set(key, record);
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: record.resetAt };
  }
  
  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt };
};

export const rateLimitResponse = (resetAt: number) => new Response(
  JSON.stringify({ error: "Rate limit exceeded", retryAfter: Math.ceil((resetAt - Date.now()) / 1000) }),
  { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
);

// Rate limit configs per function type
export const RATE_LIMITS = {
  agentRuntime: { maxRequests: 20, windowMs: 60000 },  // 20/min
  approvals: { maxRequests: 10, windowMs: 60000 },     // 10/min
  killSwitch: { maxRequests: 5, windowMs: 60000 },     // 5/min (critical)
  toolExecutor: { maxRequests: 30, windowMs: 60000 },  // 30/min
  policyEngine: { maxRequests: 50, windowMs: 60000 },  // 50/min
  orchestration: { maxRequests: 20, windowMs: 60000 }, // 20/min
  telemetry: { maxRequests: 20, windowMs: 60000 },     // 20/min
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export const authenticateRequest = async (req: Request): Promise<{ user: { id: string; email?: string } | null; error: string | null }> => {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid authorization header" };
  }
  
  const token = authHeader.replace("Bearer ", "");
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: error?.message || "Invalid token" };
  }
  
  return { user: { id: user.id, email: user.email }, error: null };
};

export const checkUserRole = async (userId: string, role: string): Promise<boolean> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();
  
  return !error && data !== null;
};

export const isTeamMember = async (userId: string): Promise<boolean> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  
  return !error && data !== null;
};

export const unauthorizedResponse = (message: string) => new Response(
  JSON.stringify({ error: message }),
  { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
);

export const forbiddenResponse = (message: string) => new Response(
  JSON.stringify({ error: message }),
  { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
);

export const badRequestResponse = (message: string) => new Response(
  JSON.stringify({ error: message }),
  { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
);
