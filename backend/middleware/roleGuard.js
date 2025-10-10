const roleGuard = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (should be added by auth middleware)
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      // Check if user has an allowed role
      if (allowedRoles.includes(req.user.userType)) {
        return next();
      }

      // User doesn't have required role
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    } catch (error) {
      console.error('Role guard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Role validation failed'
      });
    }
  };
};

module.exports = roleGuard;