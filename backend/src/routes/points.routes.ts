import express from "express";

import PointsController from "../controllers/PointsController";

const pointsRoutes = express.Router();

const pointsController = new PointsController();

pointsRoutes
  .post("/points", pointsController.create)
  .get("/points", pointsController.index)
  .get("/points/:id", pointsController.show);

export default pointsRoutes;
