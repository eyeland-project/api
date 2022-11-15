// a expressjs based application
// imports and requires
const express = require('express');

//INITIALIZE
const app = express();
require('./auth/passport');
const sequelize = require('./database');
require('./models/init-db');

// SETTINGS
app.set('port', process.env.PORT || 3000);

// MIDLEWARES
app.use(require('cors')());
app.use(require('morgan')('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// ROUTES
app.use('/api', require('./routes/auth.routes'));
app.use('/api/task', require('./routes/task.routes'));
app.use('/api/pretask', require('./routes/pretask.routes'));

// check server status
app.get('/', (req, res) => {
    res.send('Server is running');
});

// STARTING THE SERVER
app.listen(app.get('port'), async() => {
    try{
        await sequelize.authenticate();
        console.log('Database is connected');
        sequelize.sync();
    }catch(error){
        console.log('database Error: ', error);
    }
    console.log('Server on port', app.get('port'));
});
