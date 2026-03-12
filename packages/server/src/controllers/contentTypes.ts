import type { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import type { ContentType, ApiResponse } from "@cms/shared";
import { getStorage } from "../storage/index.js";

export async function listContentTypes(
  _req: Request,
  res: Response<ApiResponse<ContentType[]>>,
  next: NextFunction,
) {
  try {
    const data = await getStorage().listContentTypes();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getContentType(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ContentType>>,
  next: NextFunction,
) {
  try {
    const ct = await getStorage().getContentType(req.params.id);
    if (!ct) {
      res.status(404).json({
        error: "NotFound",
        message: "Content type not found",
        statusCode: 404,
      } as any);
      return;
    }
    res.json({ data: ct });
  } catch (err) {
    next(err);
  }
}

export async function createContentType(
  req: Request,
  res: Response<ApiResponse<ContentType>>,
  next: NextFunction,
) {
  try {
    const now = new Date().toISOString();
    const ct: ContentType = {
      id: uuid(),
      name: req.body.name,
      slug: req.body.slug,
      fields: req.body.fields ?? [],
      createdAt: now,
      updatedAt: now,
    };
    const created = await getStorage().createContentType(ct);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

export async function updateContentType(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ContentType>>,
  next: NextFunction,
) {
  try {
    const updated = await getStorage().updateContentType(
      req.params.id,
      req.body,
    );
    if (!updated) {
      res.status(404).json({
        error: "NotFound",
        message: "Content type not found",
        statusCode: 404,
      } as any);
      return;
    }
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteContentType(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await getStorage().deleteContentType(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
