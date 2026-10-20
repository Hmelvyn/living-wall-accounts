import express from "express";
import livingWallsController from "../controllers/livingWallsController.js";

const Router = express.Router();

Router.route("/living-walls")
  .get(livingWallsController.getAllLivingWalls)
  .post(livingWallsController.createLivingWall);

Router.route("/living-walls/:id")
  .get(livingWallsController.getLivingWallById)
  .put(livingWallsController.updateLivingWallById)
  .patch(livingWallsController.patchLivingWallById)
  .delete(livingWallsController.deleteLivingWallById);

export default Router;
