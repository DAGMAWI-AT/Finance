const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_secretKey;

const verifyToken = (req, res, next) => {
  // Extract token from cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach decoded user information to the request
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = verifyToken;
