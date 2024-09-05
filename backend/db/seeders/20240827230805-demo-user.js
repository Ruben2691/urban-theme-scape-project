'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        firstName: 'Demo',
        lastName: 'User',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'user1@user.io',
        firstName: 'User1',
        lastName: 'User1',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user2@user.io',
        firstName: 'User2',
        lastName: 'User2',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3')
      },
      {
        email: 'user3@user.io',
        firstName: 'User3',
        lastName: 'User3',
        username: 'FakeUser3',
        hashedPassword: bcrypt.hashSync('password4')
      },
      {
        email: 'user4@user.io',
        firstName: 'User4',
        lastName: 'User4',
        username: 'FakeUser4',
        hashedPassword: bcrypt.hashSync('password5')
      },
      {
        email: 'user5@user.io',
        firstName: 'User5',
        lastName: 'User5',
        username: 'FakeUser5',
        hashedPassword: bcrypt.hashSync('password6')
      },
      {
        email: 'user6@user.io',
        firstName: 'User6',
        lastName: 'User6',
        username: 'FakeUser6',
        hashedPassword: bcrypt.hashSync('password7')
      },
      {
        email: 'user7@user.io',
        firstName: 'User7',
        lastName: 'User7',
        username: 'FakeUser7',
        hashedPassword: bcrypt.hashSync('password8')
      },
      {
        email: 'user8@user.io',
        firstName: 'User8',
        lastName: 'User8',
        username: 'FakeUser8',
        hashedPassword: bcrypt.hashSync('password9')
      },
      {
        email: 'user9@user.io',
        firstName: 'User9',
        lastName: 'User9',
        username: 'FakeUser9',
        hashedPassword: bcrypt.hashSync('passwordd')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2', 'FakeUser3'
      , 'FakeUser4', 'FakeUser5', 'FakeUser6', 'FakeUser7', 'FakeUser8', 'FakeUser9'] }
    }, 
    {});
  }
};

