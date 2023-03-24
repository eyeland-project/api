import fs from "fs";
import { Router } from "express";
import { join } from "path";
import { directory as studentDirectory } from "../listeners/namespaces/students";
import { directory as teacherDirectory } from "../listeners/namespaces/teachers";

const router = Router();
const rel = (...path: string[]) => join(__dirname, ...path);

function chargeRoutes(dir: string = ""): void {
  console.log("loading routes from:", dir);

  fs.readdirSync(rel(dir))
    .filter(
      (file) =>
        file.match(/(.+\.)?routes\.[jt]s$/) ||
        fs.statSync(rel(dir, file)).isDirectory()
    )
    .sort((a) => {
      return a.match(/(.+\.)?routes\.[jt]s$/) ? 1 : -1;
    })
    .forEach((file) => {
      if (fs.statSync(rel(dir, file)).isDirectory()) {
        chargeRoutes(dir + "/" + file);
      } else {
        console.log("loading subRouter:", file);
        // using dynamic imports to charge every subRouter in the router
        import(rel(dir, file))
          .then(({ default: subRouter }: { default: Router }) => {
            let route = `${dir}/${file.replace(/\.?routes\.[jt]s/, "")}`;

            // ignore files that start with _
            route = route.replace(/\/_[^\/]+/g, "");
            // replace {param} with :param
            route = route.replace(/\/\{([^\/]+)\}/g, "/:$1");
            // console.log('route:', route);

            router.use(route, subRouter);
          })
          .catch((err) => {
            console.log("error reading route:", file);
            console.log(err);
          });
      }
    });
}

chargeRoutes();

router.get("/ping", (_, res) => {
  res.status(200).json({ message: "pong" });
});

router.get("/", (_, res) => {
  res.status(200).json({ message: "API is ready" });
});

router.get("/directories", (_, res) => {
  res.json({
    studentDirectory,
    teacherDirectory
  });
});

export default router;
