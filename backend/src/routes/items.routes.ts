import express from "express";
import ItemsController from "../controllers/ItemsController";

const itemsController = new ItemsController();

const itemsRoutes = express.Router();

itemsRoutes.get("/items", itemsController.index);

export default itemsRoutes;
