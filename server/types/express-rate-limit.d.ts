declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  interface Options {
    windowMs?: number;
    max?: number | ((req: any, res: any) => number | Promise<number>);
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    message?: any;
    statusCode?: number;
    requestWasSuccessful?: (req: any, res: any) => boolean;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    skip?: (req: any, res: any) => boolean | Promise<boolean>;
    keyGenerator?: (req: any, res: any) => string | Promise<string>;
    handler?: (req: any, res: any, next: any, optionsUsed: Options) => void;
    onLimitReached?: (req: any, res: any, optionsUsed: Options) => void;
  }
  function rateLimit(options?: Options): RequestHandler;
  export default rateLimit;
}
