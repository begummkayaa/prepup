import type { Router } from 'express';

/** Her modül kendi router'ını export eder; kayıt dinamik genişletilebilir. */
export type RouteModule = {
  /** Mount path (api prefix dışında, örn. "/v1/health") */
  basePath: string;
  router: Router;
};
