import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { logger } from "./logger";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

let JWT_SECRET: string;

if (process.env.JWT_SECRET) {
  JWT_SECRET = process.env.JWT_SECRET;
} else if (process.env.NODE_ENV === "production") {
  throw new Error(
    "JWT_SECRET environment variable is required in production. Set it as a secret in the Replit Secrets panel.",
  );
} else {
  JWT_SECRET = randomBytes(64).toString("hex");
  logger.warn(
    "JWT_SECRET is not set. A random ephemeral secret has been generated for this process. " +
      "All tokens will be invalidated on server restart. " +
      "Set JWT_SECRET as a secret in the Replit Secrets panel for persistent sessions.",
  );
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & jwt.JwtPayload;
  return { userId: decoded.userId, email: decoded.email };
}
