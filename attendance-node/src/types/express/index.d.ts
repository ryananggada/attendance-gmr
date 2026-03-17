import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  export interface Request {
    user?: {
      id: number;
      username: string;
      fullName: string;
      role: 'Super Admin' | 'Admin' | 'User';
      department: { id: number; name: string; isField: boolean };
      allowedDepartmentIds?: number[];
    };
  }
}
