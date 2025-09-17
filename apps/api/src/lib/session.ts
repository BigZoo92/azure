import { SignJWT, jwtVerify } from "jose";
import type { HttpResponseInit } from "@azure/functions";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function createJwt(payload: any, expiresSec = 7 * 24 * 3600) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresSec)
    .sign(secret);
}

export async function readJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as any;
}

export function cookieResponse(
  res: HttpResponseInit,
  name: string,
  value: string,
  maxAgeSec: number
): HttpResponseInit {
  const cookie = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure", // ok en prod; en local tu peux retirer si besoin
    `Max-Age=${maxAgeSec}`,
  ].join("; ");
  return { ...res, headers: { ...(res.headers || {}), "Set-Cookie": cookie } };
}

export function clearCookie(
  res: HttpResponseInit,
  name: string
): HttpResponseInit {
  const cookie = `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`;
  return { ...res, headers: { ...(res.headers || {}), "Set-Cookie": cookie } };
}

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
