function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({
    message: "Please log in to continue",
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Please log in to continue",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};