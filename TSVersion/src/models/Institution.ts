// imports
import { DataTypes } from 'sequelize';
import sequelize from '../database';
import { InstitutionModel } from '../types/Institution.types';

// model definition
const Institution = sequelize.define<InstitutionModel>('institution', {
    id_institution: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    nit: {
        type: DataTypes.STRING(9),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(320),
        allowNull: false
    }
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['nit']
        }
    ]
});

export default Institution;
module.exports = Institution;
