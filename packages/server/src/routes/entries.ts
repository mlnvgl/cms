import { Router } from "express";
import {
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
} from "../controllers/entries.js";

export const entryRoutes = Router();

entryRoutes.get("/", listEntries);
entryRoutes.get("/:id", getEntry);
entryRoutes.post("/", createEntry);
entryRoutes.put("/:id", updateEntry);
entryRoutes.delete("/:id", deleteEntry);
