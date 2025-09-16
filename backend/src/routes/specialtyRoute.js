import express from "express";
import specialtyController from "../controllers/specialtyController.js";

const specialtyRouter = express.Router();

// Rutas de especialidades
specialtyRouter.get("/", specialtyController.getAll);
specialtyRouter.get("/:id", specialtyController.getById);

export default specialtyRouter;
