const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');
const { sendWelcomeEmail } = require('../utils/email');

exports.register = async (req, res, next) => {
  try {
    logger.info('=== Starting Registration Process ===');
    logger.debug('Registration request body:', {
      ...req.body,
      password: '[REDACTED]'
    });

    // Validate request
    logger.debug('Validating request data...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Registration validation failed:', { 
        errors: errors.array(),
        requestBody: {
          ...req.body,
          password: '[REDACTED]'
        }
      });
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    logger.debug('Request validation passed');

    const { fullName, email, role, phone, password } = req.body;

    // Check for existing user
    logger.debug('Checking for existing user:', { email });
    try {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        logger.warn('Registration failed: Email already exists:', { email });
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }
      logger.debug('No existing user found with email:', { email });
    } catch (dbError) {
      logger.error('Error checking for existing user:', {
        error: dbError.message,
        stack: dbError.stack,
        email
      });
      throw dbError;
    }

    // Hash password
    logger.debug('Hashing password...');
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      logger.debug('Password hashed successfully');
    } catch (hashError) {
      logger.error('Error hashing password:', {
        error: hashError.message,
        stack: hashError.stack
      });
      throw hashError;
    }

    // Create user with hashed password
    logger.debug('Attempting to create new user:', { 
      email, 
      fullName, 
      role,
      hasPhone: !!phone 
    });
    
    try {
      const user = await User.create({
        fullName,
        email,
        role,
        phone,
        password: hashedPassword
      });

      logger.info('User created successfully:', { 
        userId: user.id, 
        email,
        role 
      });

      // Generate JWT token
      logger.debug('Generating JWT token...');
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      logger.debug('JWT token generated successfully');

      // Send welcome email
      try {
        logger.debug('Attempting to send welcome email...');
        await sendWelcomeEmail(user.email, user.fullName);
        logger.info('Welcome email sent successfully to:', user.email);
      } catch (emailError) {
        logger.error('Failed to send welcome email:', {
          error: emailError.message,
          stack: emailError.stack,
          userId: user.id,
          email: user.email
        });
        // Continue execution even if email fails
      }

      // Return success response
      logger.info('Registration completed successfully:', { 
        userId: user.id,
        email: user.email,
        role: user.role
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone
          },
          token
        }
      });
    } catch (dbError) {
      logger.error('Database error during user creation:', {
        error: dbError.message,
        stack: dbError.stack
      });
      throw dbError;
    }
  } catch (error) {
    logger.error('Registration process failed:', {
      error: error.message,
      stack: error.stack,
      requestBody: {
        ...req.body,
        password: '[REDACTED]'
      }
    });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login failed:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    next(error);
  }
}; 