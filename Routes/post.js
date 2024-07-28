const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/usermodel');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
require('dotenv').config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Mailgen configuration
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'SocialMedia',
        link: 'https://yourcompany.com/' // Your company/product website link
    }
});

// Create a new post
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/', async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const post = await newPost.save();

        // Fetch the user who created the post
        const user = await User.findById(post.userId);

        // Generate email content using Mailgen
        const emailContent = {
            body: {
                name: user.username,
                intro: `You have successfully created a new post titled "${post.title}".`,
                outro: 'If you did not create this post, please contact our support team.'
            }
        };

        const emailBody = mailGenerator.generate(emailContent);
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'New Post Created',
            html: emailBody
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a post
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to update
 *         schema:
 *           type: string
 *       - in: body
 *         name: post
 *         description: Post information to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: You can only update your own posts
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
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json({ message: 'Post updated successfully' });

            // Fetch the user who updated the post
            const user = await User.findById(post.userId);

            // Generate email content using Mailgen
            const emailContent = {
                body: {
                    name: user.username,
                    intro: `Your post titled "${post.title}" has been updated.`,
                    outro: 'If you did not update this post, please contact our support team.'
                }
            };

            const emailBody = mailGenerator.generate(emailContent);
            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'Post Updated',
                html: emailBody
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        } else {
            res.status(403).json({ message: 'You can only update your own posts' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a post
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to delete
 *         schema:
 *           type: string
 *       - in: body
 *         name: post
 *         description: Information for authorization
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: You can only delete your own posts
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
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json({ message: 'Post deleted successfully' });

            // Fetch the user who deleted the post
            const user = await User.findById(post.userId);

            // Generate email content using Mailgen
            const emailContent = {
                body: {
                    name: user.username,
                    intro: `Your post titled "${post.title}" has been deleted.`,
                    outro: 'If you did not delete this post, please contact our support team.'
                }
            };

            const emailBody = mailGenerator.generate(emailContent);
            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'Post Deleted',
                html: emailBody
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        } else {
            res.status(403).json({ message: 'You can only delete your own posts' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Like or dislike a post
/**
 * @swagger
 * /posts/{id}/like:
 *   put:
 *     summary: Like or dislike a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to like or dislike
 *         schema:
 *           type: string
 *       - in: body
 *         name: like
 *         description: User ID to like or dislike the post
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: Post liked or disliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.body.userId;
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } });
            res.status(200).json({ message: 'Post has been liked' });
        } else {
            await post.updateOne({ $pull: { likes: userId } });
            res.status(200).json({ message: 'Post has been disliked' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get a post
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
        const post = await Post.findById(req.params.id);
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment to a post
/**
 * @swagger
 * /posts/{id}/comments:
 *   put:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to add a comment to
 *         schema:
 *           type: string
 *       - in: body
 *         name: comment
 *         description: Comment to add to the post
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             comments:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   text:
 *                     type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: req.body.comments } }, { new: true });
        res.json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get timeline posts
/**
 * @swagger
 * /posts/timeline:
 *   get:
 *     summary: Get timeline posts for the current user and their friends
 *     tags: [Posts]
 *     parameters:
 *       - in: body
 *         name: userId
 *         description: ID of the current user
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: Timeline posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
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
router.get('/timeline', async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendsPosts = await Promise.all(
            currentUser.followings.map(friendId => {
                return Post.find({ userId: friendId });
            })
        );
        res.json(userPosts.concat(...friendsPosts));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         description:
 *           type: string
 *           description: The description or content of the post
 *         userId:
 *           type: string
 *           description: The ID of the user who created the post
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               text:
 *                 type: string
 *           description: List of comments on the post
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who liked the post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the post was last updated
 */
