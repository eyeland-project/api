// imports
import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { InstitutionModel } from '../types/Institution.types';

// model class definition
class Institution extends Model implements InstitutionModel {
    id_institution!: number;
    name!: string;
    nit!: string;
    address!: string;
    city!: string;
    country!: string;
    phone!: string;
    email!: string;
}

// model initialization
Institution.init({
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
    sequelize,
    modelName: 'Institution',
    tableName: 'institution',
    timestamps: false,
    // indexes: [
    //     {
    //         unique: true,
    //         fields: ['nit']
    //     }
    // ]
});

export default Institution;
module.exports = Institution;
