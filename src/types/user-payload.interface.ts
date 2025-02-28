import { Request } from 'express';

export interface UserPayload {
  userId: number;
  username: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
