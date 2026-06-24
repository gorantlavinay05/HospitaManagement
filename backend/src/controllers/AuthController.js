const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, phone, gender, dob, bloodGroup, address, emergencyContact } = req.body;
      const result = await AuthService.registerPatient(
        { name, email, password, phone },
        { gender, dob, bloodGroup, address, emergencyContact }
      );
      
      // Set refresh token in cookie for security
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      await AuthService.logout(userId);
      res.clearCookie('refreshToken');
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      const result = await AuthService.refreshToken(token);
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.status(200).json({
        status: 'success',
        message: 'Reset token generated successfully',
        data: {
          resetToken: result.resetToken // return for convenience of standard API flow testing
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;
      await AuthService.resetPassword(resetToken, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
