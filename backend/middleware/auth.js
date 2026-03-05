const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // remove "Bearer "
  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, "cevconnectsecret");

    req.user = decoded.id;
    req.userRole = decoded.role;

    next();

  } catch (err) {

    return res.status(401).json({ error: "Invalid token" });

  }

};