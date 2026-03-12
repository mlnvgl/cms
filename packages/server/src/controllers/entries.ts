import type { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import type { ContentEntry, ApiResponse } from "@cms/shared";
import { getStorage } from "../storage/index.js";

export async function listEntries(
  req: Request,
  res: Response<ApiResponse<ContentEntry[]>>,
  next: NextFunction,
) {
  try {
    const contentTypeId =
      typeof req.query.contentTypeId === "string"
        ? req.query.contentTypeId
        : undefined;
    const data = await getStorage().listEntries(contentTypeId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getEntry(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ContentEntry>>,
  next: NextFunction,
) {
  try {
    const entry = await getStorage().getEntry(req.params.id);
    if (!entry) {
      res.status(404).json({
        error: "NotFound",
        message: "Entry not found",
        statusCode: 404,
      } as any);
      return;
    }
    res.json({ data: entry });
  } catch (err) {
    next(err);
  }
}

export async function createEntry(
  req: Request,
  res: Response<ApiResponse<ContentEntry>>,
  next: NextFunction,
) {
  try {
    const now = new Date().toISOString();
    const entry: ContentEntry = {
      id: uuid(),
      contentTypeId: req.body.contentTypeId,
      fields: req.body.fields ?? {},
      status: req.body.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    };
    const created = await getStorage().createEntry(entry);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

export async function updateEntry(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ContentEntry>>,
  next: NextFunction,
) {
  try {
    const updated = await getStorage().updateEntry(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({
        error: "NotFound",
        message: "Entry not found",
        statusCode: 404,
      } as any);
      return;
    }
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteEntry(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await getStorage().deleteEntry(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
