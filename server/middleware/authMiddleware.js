const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY; // Ensure correct environment variable

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token; // ✅ Extract token from cookies

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = verifyToken;
