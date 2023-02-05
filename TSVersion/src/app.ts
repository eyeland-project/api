//* Charge environmental variables
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ override: true });
if (process.env.NODE_ENV) {
    const result = dotenv.config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`) });
    if (process.env.NODE_ENV !== "production" && result.error) {
        console.log(process.env.NODE_ENV)
        throw result.error;
    }
}

//* Express aplication
import express from 'express';
const app = express();
// imports
import cors from 'cors';
import morgan from 'morgan';
require('./database');
require('./models/init-db');
require('./auth/passport');
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('../openapi.json');

//* Express configuration and middlewares
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2);
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//* Routes
app.use('/api-legacy', require('../../legacy/src/app')._router);
import indexRoutes from './routes';
app.use('/api', indexRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//* handlers
// catch 404 and forward to error handler
import notFoundHandler from './middlewares/notFound';
app.use(notFoundHandler);

import errorHandler from './middlewares/handleErrors';
app.use(errorHandler);

export default app;
