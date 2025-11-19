interface TokenPayload {
  username: string;
  role: string;
}

declare namespace Express {
  export interface Request {
    user?: TokenPayload;
  }
}
