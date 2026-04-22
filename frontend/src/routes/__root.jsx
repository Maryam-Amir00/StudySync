import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";

import Login from "./login";
import Register from "./register";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "./dashboard";
import GroupsPage from "./groups";
import GroupDetail from "./groupDetail";

import MyPosts from "./MyPosts";
import MyGroups from "./MyGroups";
import Profile from "./Profile";
import CreateGroupPage from "./CreateGroupPage";


// ROOT
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  ),
});


// AUTH ROUTES
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


// DASHBOARD (LAYOUT)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});


// ✅ DEFAULT CHILD (VERY IMPORTANT)
const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",   // default inside dashboard
  component: GroupsPage,
});


// CHILD ROUTES
const profileRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/profile",
  component: Profile,
});

const myGroupsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/my-groups",
  component: MyGroups,
});

const myPostsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/my-posts",
  component: MyPosts,
});

const createGroupRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/create-group",
  component: CreateGroupPage,
});


// OTHER ROUTES
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


// ROUTE TREE
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,   // ✅ THIS FIXES YOUR ISSUE
    profileRoute,
    myGroupsRoute,
    myPostsRoute,
    createGroupRoute,
  ]),
  groupsRoute,
  groupDetailRoute,
]);

export const router = createRouter({
  routeTree,
});