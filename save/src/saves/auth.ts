import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
}

export const isAuthenticated = (req: any): boolean => {
  try {
    const token =
      req.cookies?.token

    if (!token) {
      return false;
    }

    jwt.verify(token, "cle_secret") as JwtPayload;
    return true;
  } catch (error) {
    return false;
  }
};