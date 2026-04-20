import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import Login from "./login";
import Register from "./register";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "./dashboard";  
import GroupsPage from "./groups";
import GroupDetail from "./groupDetail";


const rootRoute = createRootRoute({
  component: () => <Outlet />,
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
      <Dashboard />   
    </ProtectedRoute>
  ),
});


const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,  
  path: "/groups",
  component: GroupsPage,
});

const groupDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups/$groupId",
  component: GroupDetail,
});


const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  dashboardRoute,
  groupsRoute,  
  groupDetailRoute,
]);


export const router = createRouter({
  routeTree,
});