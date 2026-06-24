const UserRepository = require('../repositories/UserRepository');
const PatientRepository = require('../repositories/PatientRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');
const AppError = require('../utils/AppError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const jwt = require('jsonwebtoken');

class AuthService {
  async registerPatient(userData, patientData) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    // Set role to Patient explicitly
    userData.role = 'Patient';
    userData.status = 'active';

    const user = await UserRepository.create(userData);

    try {
      await PatientRepository.create({
        userId: user._id,
        ...patientData
      });
    } catch (err) {
      // Rollback user creation if patient creation fails
      await UserRepository.delete(user._id);
      throw err;
    }

    await ActivityLogRepository.create(user._id, 'Patient registered account');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        status: user.status
      },
      accessToken,
      refreshToken
    };
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Your account is inactive. Please contact the administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    await ActivityLogRepository.create(user._id, `User logged in`);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        status: user.status
      },
      accessToken,
      refreshToken
    };
  }

  async logout(userId) {
    const user = await UserRepository.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
      await ActivityLogRepository.create(user._id, 'User logged out');
    }
    return true;
  }

  async refreshToken(token) {
    if (!token) {
      throw new AppError('No refresh token provided', 401);
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new AppError('Refresh token is invalid or has been revoked', 401);
    }

    const accessToken = generateAccessToken(user);
    return { accessToken };
  }

  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User with this email does not exist', 404);
    }

    // Generate a secure short-lived reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'super_secret_key_for_hospital_management',
      { expiresIn: '15m' }
    );

    // In a real application, we would email this token. 
    // Here we will return it in response (or write to logs) for verification.
    await ActivityLogRepository.create(user._id, 'Requested password reset');
    return { resetToken };
  }

  async resetPassword(resetToken, newPassword) {
    try {
      const decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET || 'super_secret_key_for_hospital_management'
      );
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.password = newPassword;
      user.refreshToken = null; // Revoke old sessions
      await user.save();

      await ActivityLogRepository.create(user._id, 'Reset password successfully');
      return true;
    } catch (err) {
      throw new AppError('Reset token is invalid or expired', 400);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    user.password = newPassword;
    await user.save();

    await ActivityLogRepository.create(user._id, 'Changed password');
    return true;
  }
}

module.exports = new AuthService();
