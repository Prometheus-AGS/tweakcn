import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Force Node.js runtime for PostgreSQL compatibility
export const runtime = 'nodejs';

export const { GET, POST } = toNextJsHandler(auth.handler);
