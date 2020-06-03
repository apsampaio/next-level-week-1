import express from "express";
import itemsRoutes from "./items.routes";
import pointsRoutes from "./points.routes";

const routes = express.Router();

routes.use(itemsRoutes, pointsRoutes);

routes.get("/", (req, res) => {
  return res.json({ message: "Hello Next Level 1" });
});

export default routes;
