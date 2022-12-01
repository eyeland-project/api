// creating a sequelize instance to postgres database
const Sequelize = require('sequelize');
const {database_conf} = require('./config');


if(process.env.DB_URL){
    sequelize = new Sequelize(process.env.DB_URL,
        {
            dialect: 'postgres',
            protocol: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: false,
        });

} else {
    sequelize = new Sequelize( process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env['DB_HOST'],
        dialect: 'postgres',
        logging: false,
        ...database_conf
    });
}
// exporting the sequelize instance
module.exports = sequelize;
