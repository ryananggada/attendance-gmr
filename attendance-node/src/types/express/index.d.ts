declare namespace Express {
  export interface Request {
    session?: any;
    userId?: number;
  }
}
