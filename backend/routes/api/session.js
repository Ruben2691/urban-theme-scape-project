// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// validate login
const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Email or username is required'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required'),
  handleValidationErrors
];

// Log in
router.post(
    '/',
    validateLogin,
    async (req, res, next) => {

      try {
        const { credential, password } = req.body;
 const user = await User.unscoped().findOne({
            where: {
                [Op.or]: {
                username: credential,
                email: credential
                }
            }
 });
         console.log("User found:", user);

        if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
            const err = new Error('Login failed');
            err.status = 401;
            err.title = 'Login failed';
            err.errors = { credential: 'The provided credentials were invalid.' };
            // err.message = 'Invalid credentials'
            // return next(err);
            return res.status(401).json({
              'message': err.message
            })
        };

        const safeUser = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        };

        await setTokenCookie(res, safeUser);

        return res.status(200).json(safeUser);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      }


    }
);

// Log out
router.delete(
    '/',
    (_req, res) => {
      res.clearCookie('token');
      return res.json({ message: 'success' });
    }
);

// Restore session user
router.get(
    '/',
    (req, res) => {
      const { user } = req;
      if (user) {
        const safeUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        };
        return res.status(200).json({
          user: safeUser
        });
      } else return res.status(200).json({ user: null });
    }
);



module.exports = router;
