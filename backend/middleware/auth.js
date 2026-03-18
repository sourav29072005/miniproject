const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // remove "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth Middleware - Decoded Token:", decoded);

    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    req.userRole = decoded.role;
    console.log("Auth Middleware - Setting req.user:", req.user);

    next();

  } catch (err) {

    return res.status(401).json({ error: "Invalid token" });

  }

};