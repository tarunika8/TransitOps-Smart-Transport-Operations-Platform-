import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const VALID_ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];

/**
 * Generate a signed JWT for a given user document.
 * Payload carries just enough info (id, role, email) for downstream
 * authorization checks without another DB round-trip.
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user.
 * - Validates required fields and role.
 * - Ensures the email isn't already taken.
 * - Password hashing happens automatically via the User model's pre('save') hook.
 * Returns the created user (password excluded) and a JWT.
 */
export const registerUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    throw new AppError('name, email, password, and role are all required', 400);
  }

  if (!VALID_ROLES.includes(role)) {
    throw new AppError(`Role must be one of: ${VALID_ROLES.join(', ')}`, 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 409);
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Authenticate a user by email + password.
 * Returns a JWT and basic user info on success.
 */
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // password has `select: false` on the schema, so it must be explicitly included
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePasswords(password, user);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Compare a plaintext password against a user's stored hash.
 * Wraps the model's own bcrypt comparison method for reuse across the service.
 */
export const comparePasswords = async (candidatePassword, userDoc) => {
  return userDoc.comparePassword(candidatePassword);
};

/**
 * Change the password for an authenticated user.
 * Requires the current password to be re-verified before applying the new one.
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('currentPassword and newPassword are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await comparePasswords(currentPassword, user);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword; // re-hashed automatically by the pre('save') hook
  await user.save();

  return { message: 'Password changed successfully' };
};

/**
 * Fetch a user's profile by id (password excluded by default schema projection).
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export default {
  generateToken,
  registerUser,
  loginUser,
  comparePasswords,
  changePassword,
  getUserProfile,
};