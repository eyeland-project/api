import fs from 'fs';
import { Router } from 'express';
const router = Router();

fs.readdirSync(__dirname).filter(file => file.match(/(.+\.)?routes\.ts$/)).forEach(file => {
    console.log('loading route ', file);
    // using dynamic imports to charge every route in the router
    import(`./${file}`).then(route => {
        router.use(`/${file.replace(/\.?routes\.ts/, '')}`, route.router);
    });
});

export default router;