const Sequilize = require('sequelize');

const sequelize = new Sequilize({

    dialect: 'sqlite',
    storage: './database.sqlite',
    
});

module.exports = sequelize;
