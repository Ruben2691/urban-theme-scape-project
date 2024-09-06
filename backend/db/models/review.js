'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(
        models.Spot,
        {
          foreignKey: "spotId"
        }
      );
      Review.belongsTo(
        models.User,
        {
          foreignKey: "userId"
        }
      );
      Review.hasMany(
        models.Image,
        {
          as: 'ReviewImages',
          foreignKey: "imageableId",
          constraints: false,
          scope: {
            imageableType: 'Review'
          }
        }
      )
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
    },
    spotId: {
      type: DataTypes.INTEGER,
    },
    review: {
      type: DataTypes.TEXT,
    },
    stars: {
      type: DataTypes.DECIMAL
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};