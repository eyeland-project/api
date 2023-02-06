import fs from 'fs';
import { Router } from 'express';
const router = Router();
import path from 'path';

function chargeRoutes(dir: string): void {
    console.log('loading routes from:', dir);

    fs.readdirSync(dir).filter(file => file.match(/(.+\.)?routes\.ts$/) ||
        fs.statSync(path.join(__dirname, file)).isDirectory()).forEach(file => {

            if (fs.statSync(path.join(__dirname, file)).isDirectory()) {
                chargeRoutes(dir + '/' + file);
            } else {
                console.log('loading route:', file);
                // using dynamic imports to charge every route in the router
                import(`./${file}`).then(route => {
                    router.use(`/${file.replace(/\.?routes\.ts/, '')}`, route.router);
                }).catch(err => {
                    console.log('error reading route:', file);
                    console.log(err);
                });
            }

        });
}
chargeRoutes(__dirname);

router.get('/ping', (_, res) => {
    res.send('pong');
});

router.get('/', (_, res) => {
    res.send('Server is running');
});

export default router;