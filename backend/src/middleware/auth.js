const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret-value"; // Replace with a secure value, ideally from environment variables

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Expecting "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user data (e.g., id) to the request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { verifyToken };
