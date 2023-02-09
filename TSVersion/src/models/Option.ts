// creating the model for the Option table
// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import { OptionModel } from '../types/Option.types';
import Question from './Question';

// model definition
const Option = sequelize.define<OptionModel>('option', {
    id_option: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_question: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    feedback: {
        type: DataTypes.STRING(100)
    },
    content: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: false
});

Question.hasMany(Option, {
    foreignKey: 'id_question'
});

Option.belongsTo(Question, {
    foreignKey: 'id_question'
});

export default Option;
module.exports = Option;
