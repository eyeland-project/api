import app from './app';
import sequelize from './database';

//* start the server
const server = app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
    sequelize.authenticate().then(() => {
        console.log('Database connected');
        sequelize.sync({ force: false, alter: false }).then(() => {
            console.log('Database synchronized');
        }, (err) => {
            console.log(err);
        });
    }).catch(err => {
        console.log('Error connecting to database', err);
    });
});

// close the database connection when the server is closed
server.on('close', () => {
    sequelize.close();
});

export default server;

