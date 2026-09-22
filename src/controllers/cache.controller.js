import { cacheService } from "../services/cache/index.js";

export const setCache = async (req, res) => {
  const { key, value, ttl } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({
      error: "key and value are required",
    });
  }

  cacheService.set(key, value, ttl);

  res.status(201).json({
    message: "Value cached successfully",
    key,
  });
};

export const getCache = async (req, res) => {
  const { key } = req.params;

  const value = await cacheService.get(key);

  if (value === null) {
    return res.status(404).json({
      error: "Cache miss",
      key,
    });
  }

  res.status(200).json({
    key,
    value,
  });
};

export const deleteCache = async (req, res) => {
  const { key } = req.params;

  const deleted = await cacheService.delete(key);

  if (!deleted) {
    return res.status(404).json({
      error: "Key not found",
    });
  }

  res.status(200).json({
    message: "Cache entry deleted",
    key,
  });
};

export const getCacheStats = (req, res) => {
  res.status(200).json(cacheService.getStats());
};