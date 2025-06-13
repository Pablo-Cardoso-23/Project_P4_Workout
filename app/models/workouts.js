const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Workout = sequelize.define('Workout', {

    userId: {

        type: DataTypes.INTEGER,
        allowNull: false,   
    },

    date: {

        type: DataTypes.DATE,
        allowNull: false,
        
    },

    details: {

        type: DataTypes.TEXT,
        allowNull: true,
    }
});

module.exports = Workout;
