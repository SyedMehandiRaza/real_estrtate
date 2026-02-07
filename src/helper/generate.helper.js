const jwt = require("jsonwebtoken");

function generateToken(user, res) {
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name},
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax", 
    secure: false,    
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  return token;
}
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


module.exports = { generateOtp, generateToken };