/**
 * src/utils/auth.js
 *
 * Central place for role-based redirect logic.
 * Import getRoleRedirect() in Login.js and Register.js
 * so the destination is defined in one place.
 *
 * Roles: superadmin, admin, supervisor, cashier, customer
 *
 * Usage:
 *   import { getRoleRedirect } from '../utils/auth';
 *   navigate(getRoleRedirect(data.user));
 */

/**
 * Returns the correct dashboard path for a given user object.
 * @param {object} user - The user object from AuthContext or API response
 * @returns {string} path to redirect to
 */
export function getRoleRedirect(user) {
  switch (user?.role) {
    case 'superadmin': return '/superadmin';
    case 'admin':      return '/admin';
    case 'supervisor': return '/app/dashboard';
    case 'cashier':    return '/app/dashboard';
    case 'customer':   return '/app/portal/dashboard';
    default:           return '/login';
  }
}