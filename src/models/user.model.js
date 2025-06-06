const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

class User {
  static async create(userData) {
    const { fullName, email, role, phone, password } = userData;
    
    try {
      logger.debug('Creating new user in database:', { email, role });
      
      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          role,
          phone,
          password,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true
        }
      });

      logger.debug('User created successfully:', { userId: user.id, email });
      
      return user;
    } catch (error) {
      logger.error('Error creating user:', {
        error: error.message,
        stack: error.stack,
        email
      });
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true
        }
      });
    } catch (error) {
      logger.error('Error finding user by ID:', {
        error: error.message,
        stack: error.stack,
        userId: id
      });
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      logger.error('Error finding user by email:', {
        error: error.message,
        stack: error.stack,
        email
      });
      throw error;
    }
  }

  static async updateLastLogin(userId) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      });
      return !!user;
    } catch (error) {
      logger.error('Error updating last login:', {
        error: error.message,
        stack: error.stack,
        userId
      });
      throw error;
    }
  }

  static async changePassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      });
      return !!user;
    } catch (error) {
      logger.error('Error changing password:', {
        error: error.message,
        stack: error.stack,
        userId
      });
      throw error;
    }
  }
}

module.exports = User; 