const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { Sequelize, fn, col } = require('sequelize');
// const sequelize = require('../../config/database.js');

const { setTokenCookie, restoreUser,requireAuth } = require('../../utils/auth');
const { User, Spot, Review, ReviewImage, SpotImage } = require('../../db/models');
// const { Spot } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Delete a spot image
router.delete(
    '/:imageId',
    requireAuth,
    async(req, res) => {
        const imageId = req.params.imageId;

        // imageId is not an integer
        if (!Number(imageId)) {
            return res.status(404).json({
                "message": "Spot Image couldn't be found"
            })
        }

        const updatedImage = await SpotImage.findOne({
            where: {id:imageId},
        });

        // image not found
        if (!updatedImage) {
            res.status(404);
            return res.json({
                "message": "Spot Image couldn't be found"
            })
        }

        // image found but spot does not belong to the logged in user
        const spotId = updatedImage.spotId;
        const updatedSpot = await Spot.findOne({where: {id:spotId}})
        const userId = req.user.id; 
        
        if (Number(updatedSpot.ownerId) !== Number(userId)) {
            return res.status(403).json({
            "message": "Forbidden"
            }) 
        };

        // imageId found && matching
        await SpotImage.destroy({
            where: {id:imageId}
        }); 

        return res.status(200).json({
            "message": "Successfully deleted"
        })
    }
);

module.exports = router;

