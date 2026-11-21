import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "atelier_session";

function secret() {
  return process.env.AUTH_SECRET || "atelier-seoul-local-dev-secret";
}

export function expectedToken() {
  return createHmac("sha256", secret()).update("atelier-admin-v1").digest("hex");
}

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD || "seoul-admin";
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isValidSession(token: string | undefined | null) {
  if (!token) return false;
  const expected = expectedToken();
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
