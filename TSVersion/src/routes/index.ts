import fs from "fs";
import { Router } from "express";
import { join } from "path";
import { directory as studentDirectory } from "../listeners/namespaces/students";
import { directory as teacherDirectory } from "../listeners/namespaces/teachers";
import { Namespaces, of } from "../listeners/sockets";

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
  const students: { id: number; socketId: string }[] = [];
  for (let [key, value] of studentDirectory) {
    students.push({ id: key, socketId: value.id });
  }
  const teachers: { id: number; socketId: string }[] = [];
  for (let [key, value] of teacherDirectory) {
    teachers.push({ id: key, socketId: value.id });
  }

  res.status(200).json({
    studentDirectory: students,
    teacherDirectory: teachers
  });
});

router.get("/sockets", (_, res) => {
  const studentsSockets = of(Namespaces.STUDENTS)?.sockets;
  const teachersSockets = of(Namespaces.TEACHERS)?.sockets;

  const students: string[] = [];
  if (studentsSockets) {
    for (let [key] of studentsSockets) students.push(key);
  }

  const teachers: string[] = [];
  if (teachersSockets) {
    for (let [key] of teachersSockets) teachers.push(key);
  }

  res.status(200).json({
    studentsSockets: students,
    teachersSockets: teachers
  });
});

export default router;
