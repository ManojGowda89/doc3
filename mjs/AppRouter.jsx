import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export function CreateRouter(routes) {
  const AppRouter = () => {
    const router = createBrowserRouter(routes);
    return <RouterProvider router={router} />;
  };

  return AppRouter;
}
