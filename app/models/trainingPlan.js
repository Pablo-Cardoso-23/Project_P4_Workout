const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const { use } = require('passport');
const TrainingPlan = sequelize.define('TrainingPlan', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

module.exports = TrainingPlan;
