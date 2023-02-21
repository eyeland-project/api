// creating the model for the BlindnessAcuity table
// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/db';
import { BlindnessAcuity, BlindnessAcuityCreation } from '../types/database/BlindnessAcuity.types';

class BlindnessAcuityModel extends Model<BlindnessAcuity, BlindnessAcuityCreation> {
    declare id_blindness_acuity: number;
    declare name: string;
    declare level: number;
    declare description: string;
}

// model initialization
BlindnessAcuityModel.init({
    id_blindness_acuity: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(2048),
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'BlindnessAcuityModel',
    tableName: 'blindness_acuity',
    timestamps: false,
});

export default BlindnessAcuityModel;
