import express from "express";
import multer from "multer";
import { celebrate, Joi } from "celebrate";

import multerConfig from "../config/multer";

import PointsController from "../controllers/PointsController";

const pointsRoutes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();

pointsRoutes
  .get("/points", pointsController.index)
  .get("/points/:id", pointsController.show)
  .post(
    "/points",
    upload.single("image"),
    celebrate(
      {
        body: Joi.object().keys({
          name: Joi.string().required(),
          email: Joi.string().required().email(),
          whatsapp: Joi.number().required(),
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
          city: Joi.string().required(),
          uf: Joi.string().required().max(2),
          items: Joi.string().required(),
        }),
      },
      {
        abortEarly: false,
      }
    ),
    pointsController.create
  );

export default pointsRoutes;
