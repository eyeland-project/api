import fs from 'fs';
import { Router } from 'express';
import { join } from 'path';

const router = Router();
const rel = (...path: string[]) => join(__dirname, ...path);

function chargeRoutes(dir: string = ''): void {
    console.log('loading routes from:', dir);

    fs.readdirSync(rel(dir)).filter(file => file.match(/(.+\.)?routes\.ts$/) ||
        fs.statSync(rel(dir, file)).isDirectory()).forEach(file => {

            if (fs.statSync(rel(dir, file)).isDirectory()) {
                chargeRoutes(dir + '/' + file);
            } else {
                console.log('loading route:', file);
                // using dynamic imports to charge every route in the router
                import(rel(dir, file)).then(({ default: subRouter }: { default: Router }) => {
                    router.use(`${dir}/${file.replace(/\.?routes\.ts/, '')}`, subRouter);
                }).catch(err => {
                    console.log('error reading route:', file);
                    console.log(err);
                });
            }

        });
}
chargeRoutes();

router.get('/ping', (_, res) => {
    res.send('pong');
});

router.get('/', (_, res) => {
    res.send('Server is running');
});

export default router;