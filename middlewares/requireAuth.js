import { getAuth } from "@clerk/express";

export function requireAuth(req, res, next) {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  req.auth = auth; 
  next();
}
