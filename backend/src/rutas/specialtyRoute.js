import express from "express";
import specialtyController from "../controladores/especialidadController.js";

const specialtyRouter = express.Router();

// Rutas de especialidades
specialtyRouter.get("/", specialtyController.getAll);
specialtyRouter.get("/:id", specialtyController.getById);

export default specialtyRouter;
