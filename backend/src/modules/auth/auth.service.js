const bcrypt = require("bcryptjs");
const User = require("../user/user.model");
const { generateToken } = require("../../utils/jwt");


/**
 * 
 */
exports.register = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken({ id: user._id, role: user.role });

  return { user, token };
};

/**
 * 
 */
exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken({ id: user._id, role: user.role });

  return { user, token };
};
