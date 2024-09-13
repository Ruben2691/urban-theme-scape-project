// backend/routes/api/spots.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const { Sequelize, fn, col } = require('sequelize');

const { setTokenCookie, restoreUser, requireAuth, validateAuthSpot, validateAuthNotSpot } = require('../../utils/auth');
const { User, Spot, Review, SpotImage, ReviewImage, Booking } = require('../../db/models');
const { handleValidationErrors,validateBookingId,validateSpotId,validateReviewId,validateSpotImageId,validateReviewImageId, validateReviewExists, validateBookingConflicts } = require('../../utils/validation');

const { check, query } = require('express-validator');
// const { handleValidationErrors, validateSpotId } = require('../../utils/validation');

const router = express.Router();

// validate spot
const validateSpot = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Country is required'),
    check('lat')
      .exists({ checkFalsy: true })
      .isFloat({min: -90, max: 90})
      .withMessage('Latitude must be within -90 and 90'),
    check('lng')
      .exists({ checkFalsy: true })
      .isFloat({min: -180, max: 180})
      .withMessage('Longitude must be within -180 and 180'),
    check('name')
      .exists({checkFalsy: true})
      .isLength({max:49})
      .withMessage('Name must be less than 50 characters'),
    check('description')
      .exists({checkFalsy: true})
      .withMessage('Description is required'),
    check('price')
      .exists({checkFalsy: true})
      .isFloat({min:0})
      .withMessage('Price per day must be a positive number'),
    handleValidationErrors
  ];

// validate a review
const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .isInt({min:1, max:5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
];

// validate params
const validateParams = [
  query('page')
    .optional()
    .isFloat({min:1})
    .withMessage('Page must be greater than or equal to 1'),
  query('size')
    .optional()
    .isFloat({min:1, max:20})
    .withMessage('Size must be between 1 and 20'),
  query('minLat')
    .optional()
    // .isDecimal()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Minimum latitude is invalid'),
  query('maxLat')
    .optional()
    .isDecimal()
    .isFloat({min: -90, max: 90})
    .withMessage('Maximum latitude is invalid'),
  query('minLng')
    .optional()
    // .isDecimal()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Minimum longitude is invalid'),
  query('maxLng')
    .optional()
    .isDecimal()
    .isFloat({min: -180, max: 180})
    .withMessage('Maximum longitude is invalid'),
  query('minPrice')
    .optional()
    // .isDecimal()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be greater than or equal to 0'),
  query('maxPrice')
    .optional()
    .isDecimal()
    .isFloat({min: 0})
    .withMessage('Maximum price must be greater than or equal to 0'),
  handleValidationErrors
];

// validate start & end dates for booking
const validateDates = [
    // Check if startDate exists and is not before today
    check('startDate')
      .exists({ checkFalsy: true })
      .custom((value) => {
        const today = new Date().setHours(0, 0, 0, 0);  // Set today's date without time
        const startDate = new Date(value).setHours(0, 0, 0, 0);
        if (startDate < today) {
            throw new Error('startDate cannot be in the past');
        }
        return true
      }),
  
    // Check if endDate exists and is not before or on the same day as startDate
    check('endDate')
      .exists({ checkFalsy: true })
      .custom((value, { req }) => {
        const startDate = new Date(req.body.startDate).setHours(0, 0, 0, 0);
        const endDate = new Date(value).setHours(0, 0, 0, 0);
        if (endDate <= startDate) {
          throw new Error('endDate cannot be on or before startDate');
        }
        return true;
      }),
    handleValidationErrors
];


// Get all spots: no login required
router.get(
    '/',
    validateParams,
    async (req, res) => {

      let {page=1, size=20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice} = req.query;
      const where = {};
      const pagination = {};

      const pageN = parseInt(page, 10);
      const sizeN = parseInt(size, 10);
      const minLatN = parseFloat(minLat);
      const maxLatN = parseFloat(maxLat);
      const minLngN = parseFloat(minLng);
      const maxLngN = parseFloat(maxLng);
      const minPriceN = parseFloat(minPrice);
      const maxPriceN = parseFloat(maxPrice);

      // all valid params
      pagination.limit = sizeN;
      pagination.offset = sizeN * (pageN-1);

      // create where filters
      if (minLat || maxLat) {
        where.lat = {
          ...(minLat && { [Op.gte]: minLatN }),
          ...(maxLat && { [Op.lte]: maxLatN })
        };
      }

      if (minLng || maxLng) {
        where.lng = {
          ...(minLng && { [Op.gte]: minLngN }),
          ...(maxLng && { [Op.lte]: maxLngN })
        };
      }

      if (minPrice || maxPrice) {
        where.price = {
          ...(minPrice && { [Op.gte]: minPriceN }),
          ...(maxPrice && { [Op.lte]: maxPriceN })
        };
      }

      const spots = await Spot.findAll({
        where,
        include: [
          { 
            model: Review,
            attributes: [], // We don't need the full review data, just the average
            // subQuery: false,
            // duplicating: false,
          },
          {
            model: SpotImage,
            as: 'SpotImages',  // The alias defined in the association
            attributes: [],
            where: {preview: true},
            required: false
            // subQuery: false
            // separate: true,
          }
        ],
        attributes: {
          include: [
            [
              fn('ROUND', fn('AVG', col('Reviews.stars')), 1),
              //Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), // Aggregating the stars from Review
              'avgRating'  // Alias for the result
            ],
            [
              Sequelize.col('SpotImages.url'),
              "previewImage"
            ]
          ]
        },
        group: ['Spot.id', 'SpotImages.id'],  // Grouping by Spot.id to get avgRating for each spot
        ...pagination,
        subQuery: false
      });

      return res.status(200).json({
        Spots:spots,
        Page: pageN,
        Size: sizeN
      });
    }
);



// get spots for current user
router.get(
    '/current',
    requireAuth,
    async(req, res) => {
        const current = req.user.id;

        const spots = await Spot.findAll({
           where: {ownerId:current},
           include: [
            {
              model: Review,
              attributes: []  // We don't need the full review data, just the average
            },
            {
              model: SpotImage,
              as: 'SpotImages',  // The alias defined in the association
              attributes: [],
              where: {preview: true},
              required: false
            }
          ],
            attributes: {
              include: [
                [
                  fn('ROUND', fn('AVG', col('Reviews.stars')), 1), // Aggregating the stars from Review
                  'avgRating'  // Alias for the result
                ],
                [
                  col('SpotImages.url'),
                  "previewImage"
                ]
              ]
            },
            group: ['Spot.id', 'SpotImages.url']  // Grouping by Spot.id to get avgRating for each spot
        });
        return res.status(200).json({
          Spots: spots
        });
    }
)

// Get details of a Spot from an id
router.get(
    '/:spotId',
    validateSpotId,
    async(req, res) => {
        const spotId = req.params.spotId;

        const spots = await Spot.findAll({
          where: {id:spotId},
          include: [
           {
             model: Review,
             attributes: []  // We don't need the full review data, just the average
           },
           {
             model: SpotImage,
             as: 'SpotImages',
             attributes: ['id', 'url', 'preview']
           },
           {
             model: User,
             as: 'Owner',
             attributes: ['id', 'firstName', 'lastName']
           }
         ],
           attributes: {
             include: [
               [
                 fn('AVG', col('Reviews.stars')), // Aggregating the stars from Review
                 'avgRating'  // Alias for the result
               ],
               [
                 fn('COUNT', col('Reviews.id')), // Counting the # of Reviews 
                 'numReviews'  // Alias for the result
               ]
             ]
           },
           group: ['Spot.id', 'SpotImages.id', 'Owner.id'] 
       });

        // spot Id found
        
        return res.status(200).json(spots);
    }
);

// Create a Spot
router.post(
    '/',
    requireAuth,
    validateSpot,
    async(req, res) => {

        const ownerId = req.user.id;
        const {address, city, state, country, lat, lng, name, description, price} = req.body;

        const newSpot = await Spot.create({
            ownerId,
            address,
            city, 
            state,
            country,
            lat,
            lng,
            name,
            description,
            price
        })

        return res.status(201).json(newSpot);
    }
);

// Add an Image to a Spot based on the Spot's id
router.post(
    '/:spotId/images',
    requireAuth,
    validateAuthSpot,
    validateSpotId,
    async(req, res) => {
        const spotId = req.params.spotId;
        
        // spotId found & matching
        const {url, preview} = req.body;
        const newImage = await SpotImage.create({
            spotId: spotId,
            url,
            preview
        })

        return res.status(201).json({
            "id": newImage.id,
            "url": url,
            "preview": preview
        })

    }
);

// Edit a Spot
router.put(
    '/:spotId',
    requireAuth,
    validateAuthSpot,
    validateSpotId,
    validateSpot,
    async (req, res) => {
      const spotId = req.params.spotId;

      // spotId not found
      const updatedSpot = await Spot.findOne({
        where: {id:spotId},
      });

    // spotId found && matching
      const {address, city, state, country, lat, lng, name, description, price} = req.body;

      await updatedSpot.update({
          address: address?address:updatedSpot.address,
          city: city?city:updatedSpot.city,
          state: state?state:updatedSpot.state,
          country: country?country:updatedSpot.country,
          lat: lat?lat:updatedSpot.lat,
          lng: lng?lng:updatedSpot.lng,
          name: name?name:updatedSpot.name,
          description: description?description:updatedSpot.description,
          price: price?price:updatedSpot.price,
      });

      return res.status(200).json(updatedSpot)
    }
)

// Delete a Spot
router.delete(
    '/:spotId',
    requireAuth,
    validateSpotId,
    validateAuthSpot,
    
    async(req, res) => {
      const spotId = req.params.spotId;

      // spotId found
      await Spot.destroy({
          where: {id:spotId}
      });

      return res.json({
          "message": "Successfully deleted"
      })
    }
);

/////////////////////////////////////////////////
// Reviews related

// Get all Reviews by a Spot's id
router.get(
  '/:spotId/reviews',
  validateSpotId,
  async(req, res) => {
      const spotId = req.params.spotId;

      // spot Id found
      const reviews = await Review.findAll({
         where: {spotId:spotId},
         include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: ReviewImage,
            as: 'ReviewImages',
            attributes: ['id', 'url']
          },
        ],
          group: ['Review.id', 'User.id', 'ReviewImages.id'] 
      });
      return res.status(200).json({
        Reviews: reviews
      });
  }
);

// Create a Review for a Spot based on the Spot's id
router.post(
  '/:spotId/reviews',
  requireAuth,
  validateSpotId,
  validateReviewExists,
  validateReview,
  async(req, res) => {
      const spotId = Number(req.params.spotId);

      // with logged in user
      const userId = req.user.id;

      // spotId found
      const {review, stars} = req.body;
      const newReview = await Review.create({
          userId,
          spotId,
          review,
          stars
      })

      return res.status(201).json(newReview);

  }
);

/////////////////////////////////////////////////////////
// bookings related

// Get all bookings by a Spot's id
router.get(
  '/:spotId/bookings',
  requireAuth,
  validateSpotId,
  async(req, res) => {
      const spotId = req.params.spotId;

      // spotId not found
      const spot = await Spot.findOne({
          where: {id:spotId}
      });

      const current = req.user.id;

      // find owner of the spot
      const ownerId = Number(spot.ownerId)
      
      // spot Id found & current user is not the owner
      if (ownerId !== Number(current)) {
        const bookingsUser = await Booking.findAll({
          where: {spotId:spotId, userId:current},
          attributes: ['spotId', 'startDate', 'endDate'],
        });
        return res.status(200).json({
          Bookings: bookingsUser
        });
      } else {
        
        // spot Id found & current user is the owner
        const bookingsOwner = await Booking.findAll({
          where: {spotId:spotId},
          include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          },
          ],
          group: ['Booking.id', 'User.id'] 
        });

        // reordering the output
        const formattedBookings = bookingsOwner.map(booking => {
          const { User, ...bookingData } = booking.toJSON();  // Destructure the object to separate User and booking data
          return {
            User,             // Add User details first
            ...bookingData    // Spread the rest of the booking details afterward
          };
        });
        
        return res.status(200).json({
          bookings: formattedBookings
        });
      }
  }
);

// Create a Booking from a Spot based on the Spot's id
router.post(
  '/:spotId/bookings',
  requireAuth,
  validateAuthNotSpot,
  validateSpotId,
  validateDates,
  validateBookingConflicts,
  async(req, res) => {
      const spotId = req.params.spotId;

      const current = req.user.id;

      // spotId not found
      const spot = await Spot.findOne({
          where: {id:spotId}
      });

      // find owner of the spot
      let ownerId = Number(spot.ownerId);
      
      const {startDate, endDate} = req.body;

    //   // startDate in the past or endDate > startDate
    //   if (new Date(startDate) < new Date() || new Date(startDate) > new Date(endDate)) {
    //     return res.status(400).json({
    //       "message": "Bad Request", 
    //       "errors": {
    //         "startDate": "startDate cannot be in the past",
    //         "endDate": "endDate cannot be on or before startDate"
    //       }
    //     })
    //   }
     
      // all requirements passed
      const newBooking = await Booking.create({
          spotId: spotId,
          userId: current,
          startDate,
          endDate,
      })

      return res.status(201).json(newBooking);
  }
);

module.exports = router;

