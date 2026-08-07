import { AppError } from '../utils/app-error.js'

export function requireRoles(...roles) {
  return function roleMiddleware(req, _res, next) {
    const userRole = req.user?.role
    if (!userRole) {
      return next(new AppError('Authenticated user role is missing', 403, 'ROLE_MISSING'))
    }
    if (!roles.includes(userRole)) {
      return next(new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN'))
    }
    return next()
  }
}
