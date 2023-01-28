// import the app
const app = require('./app');

// STARTING THE SERVER
app.listen(app.get('port'), async () => {
    try{
        sequelize.authenticate().then(() => {
            console.log('Connection has been established successfully.');
            console.log('Database is connected');
            sequelize.sync();
        }).catch(err => {
            console.error('Unable to connect to the database:', err);
        });
    }catch(error){
        console.log('database Error: ', error);
    }
    console.log('Server on port', app.get('port'));
});