import { Route } from "../../models/route.model.js";

export const findRoute = async (path) => {
  const routes = await Route.find({
    enabled: true,
  });

  return routes.find((route) => path.startsWith(route.prefix));
};