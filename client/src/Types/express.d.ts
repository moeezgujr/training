// src/types/express.d.ts

import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    // Add any custom properties you use
    session?: any; // or better: import your Session type
  }

  // This makes sure req.method, req.path, res.json, res.statusCode etc. are visible
  interface Response {
    json: (body?: any, ...args: any[]) => Response;
    statusCode: number;
    on(event: 'finish', listener: () => void): this;
  }
}