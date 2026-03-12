import { Router } from "express";
import {
  listContentTypes,
  getContentType,
  createContentType,
  updateContentType,
  deleteContentType,
} from "../controllers/contentTypes.js";

export const contentTypeRoutes = Router();

contentTypeRoutes.get("/", listContentTypes);
contentTypeRoutes.get("/:id", getContentType);
contentTypeRoutes.post("/", createContentType);
contentTypeRoutes.put("/:id", updateContentType);
contentTypeRoutes.delete("/:id", deleteContentType);
