export const roleMiddleware = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied. No role assigned." });
    }
  
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires ${requiredRole} role.` });
    }
  
    next(); // User has the correct role → proceed
  };
  