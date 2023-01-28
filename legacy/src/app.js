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
app.use('/api/pregunta', require('./routes/pregunta.routes'));

// check server status
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/test', async (req, res) => {
    const resp = await sequelize.query("Select * from information_schema.columns where table_name = 'links';");
    res.send(resp[0].map((item) => [item.column_name, item.data_type]));
    // const resp = await sequelize.query("SELECT * FROM information_schema.tables WHERE table_schema = 'public';");
    // res.send(resp[0].map((item) => item.table_name));
});

module.exports = app;
