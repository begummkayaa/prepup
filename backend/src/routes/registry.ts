import type { RouteModule } from '../types/module.js';
import { v1Module } from '../modules/v1/index.js';

/**
 * Yeni modül eklemek için bu diziye RouteModule eklemen yeterli.
 */
export function getRouteModules(): RouteModule[] {
  return [v1Module];
}
