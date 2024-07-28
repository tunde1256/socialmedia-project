const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const User = require('../models/usermodel'); // Adjust the path as needed
require('dotenv').config();

const auth = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'hotmail', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER, // Using environment variable for email
        pass: process.env.EMAIL_PASS  // Your email password or an app-specific password from environment variable
    }
});

// Mailgen configuration
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'SocialMedia', // Your company/product name
        link: 'https://yourcompany.com/' // Your company/product website link
    }
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for user authentication
 */

/**
 * @swagger
* /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
auth.post('/register', async function (req, res) {
    const { username, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        const user = await newUser.save();

        // Generate registration confirmation email content using Mailgen
        const emailContent = {
            body: {
                name: username,
                intro: 'Welcome to SocialMedia! We are excited to have you.',
                action: {
                    instructions: 'To get started with your account, please click here:',
                    button: {
                        color: '#22BC66', // Optional button color
                        text: 'Confirm your account',
                        link: 'https://yourcompany.com/confirm' // Link to account confirmation page
                    }
                },
                outro: 'If you did not register for this account, please disregard this email.'
            }
        };

        const emailBody = mailGenerator.generate(emailContent);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Registration Successful',
            html: emailBody
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
auth.post('/login', async function (req, res) {
    const user = await User.findOne({ email: req.body.email });
    try {
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        } else {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate login notification email content using Mailgen
            const emailContent = {
                body: {
                    name: user.username,
                    intro: 'You have successfully logged into your account.',
                    outro: 'If you did not log in, please contact our support team.'
                }
            };

            const emailBody = mailGenerator.generate(emailContent);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Login Notification',
                html: emailBody
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.json({ message: 'Logged in successfully', user });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = auth;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The hashed password of the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the user was last updated
 */
