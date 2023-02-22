/// <reference path="./types/custom/customTypes.d.ts" />
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
require('./database/db');
require('./models');
require('./config/passport');

// docs
import swaggerUi from 'swagger-ui-express';
const docsStudents = require('../openapi-students.json');
const docsTeachers = require('../openapi-teachers.json');

//* Express configuration and middlewares
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2);
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//* Routes
import indexRoutes from './routes';
// console.log(indexRoutes.stack);

app.use('/api', indexRoutes);
app.use('/api-docs/teachers', swaggerUi.serveFiles(docsTeachers), swaggerUi.setup(docsTeachers));
app.use('/api-docs/students', swaggerUi.serveFiles(docsStudents), swaggerUi.setup(docsStudents));
app.use('/api-docs', (_, res) => res.redirect('/api-docs/students'));
app.get('/', (_, res) => {
    res.status(200).json({ message: 'Server is running' });
});

//* handlers
// catch 404 and forward to error handler
import notFoundHandler from './middlewares/notFound';
app.use(notFoundHandler);

import errorHandler from './middlewares/handleErrors';
app.use(errorHandler);

export default app;
