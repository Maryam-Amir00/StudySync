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


const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-right" reverseOrder={false} />
    </>
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
      <Dashboard />
    </ProtectedRoute>
  ),
});


const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",   
  component: GroupsPage,
});

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
  dashboardRoute.addChildren([
    dashboardIndexRoute,   
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