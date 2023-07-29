import { Router } from "express";
import { postGame, getGames } from "../controllers/games.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { schemaGames } from "../schemas/game.schema.js";

const gamesRouter = Router();

gamesRouter.post("/games", validateSchema(schemaGames), postGame);
gamesRouter.get("/games", getGames);

export default gamesRouter;
