const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/usermodel');

// Update User
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user's information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         description: User information to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             userId:
 *               type: string
 *             isAdmin:
 *               type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Unauthorized to update this profile
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
 *                 message:
 *                   type: string
 */
router.put('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.json({ message: 'User updated successfully', user: updatedUser });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        return res.status(400).json({ message: 'You are not authorized to update this profile' });
    }
});

// Delete User
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         description: User information for authorization
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *             isAdmin:
 *               type: boolean
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Unauthorized to delete this profile
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
 *                 message:
 *                   type: string
 */
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const deleteUser = await User.findByIdAndDelete(req.params.id);
            res.json({ message: 'Account has been deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        return res.status(400).json({ message: 'You are not authorized to delete this profile' });
    }
});

// Get User
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user's information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
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
 *                 message:
 *                   type: string
 */
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, updatedAt, ...others } = user._doc;
        res.json(others);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Follow User
/**
 * @swagger
 * /users/{id}/follow:
 *   put:
 *     summary: Follow a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to follow
 *         schema:
 *           type: string
 *       - in: body
 *         name: follow
 *         description: Information about the user who is following
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 currentUser:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: You cannot follow yourself
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
 *                 message:
 *                   type: string
 */
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId === req.params.userId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId } });
            await currentUser.updateOne({ $push: { followings: req.params.id } });
            res.json({ message: 'User followed successfully', user, currentUser });
        } else {
            res.json({ message: 'User is already following this user' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unfollow User
/**
 * @swagger
 * /users/{id}/unfollow:
 *   put:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to unfollow
 *         schema:
 *           type: string
 *       - in: body
 *         name: unfollow
 *         description: Information about the user who is unfollowing
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 currentUser:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: You cannot unfollow yourself
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
 *                 message:
 *                   type: string
 */
router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId === req.params.userId) {
        return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
            await user.updateOne({ $pull: { followers: req.body.userId } });
            await currentUser.updateOne({ $pull: { followings: req.params.id } });
            res.json({ message: 'User unfollowed successfully', user, currentUser });
        } else {
            res.json({ message: 'User is not following this user' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

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
 *         followers:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs following this user
 *         followings:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs this user is following
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the user was last updated
 */
