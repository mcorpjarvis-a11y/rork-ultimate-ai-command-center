declare module 'compression' {
  import { RequestHandler } from 'express';

  export interface CompressionOptions {
    level?: number;
    memLevel?: number;
    threshold?: number | string;
    filter?(req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]): boolean;
  }

  function compression(options?: CompressionOptions): RequestHandler;
  export default compression;
}

declare module 'helmet' {
  import { RequestHandler } from 'express';

  export interface HelmetOptions {
    contentSecurityPolicy?: false | Record<string, unknown>;
    crossOriginEmbedderPolicy?: boolean;
    crossOriginOpenerPolicy?: boolean | Record<string, unknown>;
    crossOriginResourcePolicy?: boolean | Record<string, unknown>;
    dnsPrefetchControl?: boolean | Record<string, unknown>;
    expectCt?: boolean | Record<string, unknown>;
    frameguard?: boolean | Record<string, unknown>;
    hidePoweredBy?: boolean | Record<string, unknown>;
    hsts?: boolean | Record<string, unknown>;
    ieNoOpen?: boolean | Record<string, unknown>;
    noSniff?: boolean | Record<string, unknown>;
    originAgentCluster?: boolean;
    permittedCrossDomainPolicies?: boolean | Record<string, unknown>;
    referrerPolicy?: boolean | Record<string, unknown>;
    xssFilter?: boolean | Record<string, unknown>;
  }

  function helmet(options?: HelmetOptions): RequestHandler;
  export default helmet;
}
