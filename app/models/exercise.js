const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Exercise = sequelize.define('Exercise', {

    id: {type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    trainingPlanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    series: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    repetitions: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

module.exports = Exercise;
