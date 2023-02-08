import fs from 'fs';
import { Router } from 'express';
import { join } from 'path';

const router = Router();
const rel = (...path: string[]) => join(__dirname, ...path);

function chargeRoutes(dir: string = ''): void {
    console.log('loading routes from:', dir);

    fs.readdirSync(rel(dir))
        .filter(file => (
            file.match(/(.+\.)?routes\.ts$/) || fs.statSync(rel(dir, file)).isDirectory()
        ))
        .forEach(file => {

            if (fs.statSync(rel(dir, file)).isDirectory()) {
                chargeRoutes(dir + '/' + file);
            } else {
                console.log('loading subRouter:', file);
                // using dynamic imports to charge every subRouter in the router
                import(rel(dir, file)).then(({ default: subRouter }: { default: Router }) => {
                    let route = `${dir}/${file.replace(/\.?routes\.ts/, '')}`;

                    // ignore files that start with _
                    route = route.replaceAll(/\/_[^\/]+/g, "");
                    // replace {param} with :param
                    route = route.replaceAll(/\/\{([^\/]+)\}/g, "/:$1");
                    // console.log('route:', route);

                    router.use(route, subRouter);
                }).catch(err => {
                    console.log('error reading route:', file);
                    console.log(err);
                });
            }

        });
}

chargeRoutes();

router.get('/ping', (_, res) => {
    res.status(200).json({ message: 'pong' });
});

router.get('/', (_, res) => {
    res.status(200).json({ message: 'API is ready' });
});

export default router;