// src/routes/__root.jsx

import {
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,
  } from "@tanstack/react-router";
  
  import Login from "./login";
  import Register from "./register";
  import ProtectedRoute from "../components/ProtectedRoute";
  
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <Outlet />
      </div>
    ),
  });
  
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Login,
  });
  
  const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: Register,
  });
  

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    component: () => (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  });
  
  const routeTree = rootRoute.addChildren([
    loginRoute,
    registerRoute,
    dashboardRoute,
  ]);
  
  export const router = createRouter({
    routeTree,
  });