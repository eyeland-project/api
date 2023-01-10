import * as dotenv from 'dotenv';
dotenv.config({override: true});
import * as path from 'path';
const result = dotenv.config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`) });
if (result.error) {
    throw result.error;
}
// Express aplication
import express from 'express';
const app = express();
// imports
import cors from 'cors';
import morgan from 'morgan';

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
import indexRoutes from './routes';
app.use(indexRoutes);

// start the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});