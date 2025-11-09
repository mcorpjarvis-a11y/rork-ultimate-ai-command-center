/**
 * API Versioning Middleware
 * 
 * Supports versioning through:
 * 1. URL path: /api/v1/resource, /api/v2/resource
 * 2. Header: Accept: application/vnd.jarvis.v1+json
 * 3. Query param: /api/resource?version=1
 * 
 * Default version: v1
 */

import { Request, Response, NextFunction } from 'express';

export type ApiVersion = 'v1' | 'v2';

export interface VersionedRequest extends Request {
  apiVersion: ApiVersion;
}

export const DEFAULT_VERSION: ApiVersion = 'v1';
export const SUPPORTED_VERSIONS: ApiVersion[] = ['v1', 'v2'];

/**
 * Extract API version from request
 */
function extractVersion(req: Request): ApiVersion {
  // 1. Check URL path (/api/v1/resource or /api/v2/resource)
  const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    const version = pathMatch[1] as ApiVersion;
    if (SUPPORTED_VERSIONS.includes(version)) {
      return version;
    }
  }

  // 2. Check Accept header (Accept: application/vnd.jarvis.v1+json)
  const acceptHeader = req.headers.accept || '';
  const headerMatch = acceptHeader.match(/application\/vnd\.jarvis\.(v\d+)\+json/);
  if (headerMatch) {
    const version = headerMatch[1] as ApiVersion;
    if (SUPPORTED_VERSIONS.includes(version)) {
      return version;
    }
  }

  // 3. Check query parameter (?version=1 or ?v=1)
  const queryVersion = req.query.version || req.query.v;
  if (queryVersion) {
    const version = `v${queryVersion}` as ApiVersion;
    if (SUPPORTED_VERSIONS.includes(version)) {
      return version;
    }
  }

  // Default to v1
  return DEFAULT_VERSION;
}

/**
 * API Versioning Middleware
 * Extracts and attaches version to request object
 */
export function apiVersioning(req: Request, res: Response, next: NextFunction): void {
  const version = extractVersion(req);
  (req as VersionedRequest).apiVersion = version;

  // Add version to response headers for client awareness
  res.setHeader('X-API-Version', version);

  next();
}

/**
 * Version-specific route wrapper
 * Use to create version-specific handlers
 * 
 * Example:
 * router.get('/resource', 
 *   versionedHandler({
 *     v1: handleV1,
 *     v2: handleV2,
 *   })
 * );
 */
export function versionedHandler(handlers: {
  v1?: (req: Request, res: Response, next: NextFunction) => void;
  v2?: (req: Request, res: Response, next: NextFunction) => void;
  default?: (req: Request, res: Response, next: NextFunction) => void;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const version = (req as VersionedRequest).apiVersion || DEFAULT_VERSION;
    const handler = handlers[version] || handlers.default;

    if (!handler) {
      return res.status(501).json({
        error: {
          code: 'VERSION_NOT_IMPLEMENTED',
          message: `API version ${version} is not implemented for this endpoint`,
          supportedVersions: SUPPORTED_VERSIONS,
        },
      });
    }

    handler(req, res, next);
  };
}

/**
 * Require specific API version
 * Returns 400 if version doesn't match
 */
export function requireVersion(requiredVersion: ApiVersion) {
  return (req: Request, res: Response, next: NextFunction) => {
    const version = (req as VersionedRequest).apiVersion;

    if (version !== requiredVersion) {
      return res.status(400).json({
        error: {
          code: 'VERSION_MISMATCH',
          message: `This endpoint requires API version ${requiredVersion}`,
          currentVersion: version,
        },
      });
    }

    next();
  };
}

/**
 * Deprecation warning middleware
 * Adds deprecation headers for old API versions
 */
export function deprecationWarning(deprecatedVersion: ApiVersion, sunsetDate?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const version = (req as VersionedRequest).apiVersion;

    if (version === deprecatedVersion) {
      res.setHeader('Deprecation', 'true');
      if (sunsetDate) {
        res.setHeader('Sunset', sunsetDate);
      }
      res.setHeader('Link', '</api/v2>; rel="successor-version"');
    }

    next();
  };
}

export default apiVersioning;
