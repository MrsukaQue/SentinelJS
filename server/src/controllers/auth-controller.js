import {
  authenticate,
  clearSessionCookie,
  register,
  setSessionCookie,
  signAccessToken,
} from '../services/auth-service.js';

export async function registerUser(req, res) {
  const user = await register(req.validated.body.email, req.validated.body.password);
  setSessionCookie(res, signAccessToken(user));
  res.status(201).json({ data: { user } });
}

export async function loginUser(req, res) {
  const user = await authenticate(req.validated.body.email, req.validated.body.password);
  setSessionCookie(res, signAccessToken(user));
  res.json({ data: { user } });
}

export function logoutUser(_req, res) {
  clearSessionCookie(res);
  res.json({ data: { loggedOut: true } });
}
