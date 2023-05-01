import { Router } from "express";
import { login } from "@controllers/admin/auth.controller";
import fs from "fs";
import { join } from "path";
import passport from "passport";

const router = Router();

router.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome to the Admins API" });
});
router.post("/login", login);

function loadRoutes() {
  const auth = passport.authenticate("jwt-student", { session: false });
  const routerDyn = Router();
  routerDyn.use(auth);
  router.use(routerDyn);

  const dir = join(__dirname, "..", "..", "controllers", "admin");

  fs.readdirSync(dir).forEach((file) => {
    const filePath = join(dir, file);
    if (
      !file.match(/^(?!_\.|auth\.).+\.controller\.[jt]s$/) ||
      !fs.statSync(filePath).isFile()
    ) {
      return;
    }
    import(filePath)
      .then((controllers) => {
        const entity = file.split(".")[0];
        const resource =
          entity.at(-1)! === "y" ? entity.slice(0, -1) + "ies" : entity + "s";

        routerDyn.get(`/${resource}/:id`, controllers["getElement"]);
        routerDyn.get(`/${resource}/`, controllers["getElements"]);
        routerDyn.post(`/${resource}/`, controllers["createElement"]);
        routerDyn.put(`/${resource}/:id`, controllers["updateElement"]);
        routerDyn.delete(`/${resource}/:id`, controllers["deleteElement"]);
      })
      .catch((err) => {
        console.log(`Error reading admin routes: ${file}`, err);
      });
  });
}

loadRoutes();

export default router;
