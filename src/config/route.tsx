import Login from "pages/Authentication/Login";
import Logout from "pages/Authentication/Logout";
import Color from "pages/Color";
import SideBarPage from "pages/SideBar";
import Typography from "pages/Typography";
import { Redirect } from "react-router";
import {
  COLOR_PAGE_ROUTE,
  LOGIN_ROUTE,
  LOGOUT_ROUTE,
  SIDE_BAR_PAGE_ROUTE,
  TYPOGRAPHY_PAGE_ROUTE,
} from "./route-consts";

export interface Route {
  path: string;
  component: () => JSX.Element;
  exact?: boolean;
}

const userRoutes: Route[] = [
  // Default init route for template:

  {
    path: TYPOGRAPHY_PAGE_ROUTE,
    component: Typography,
  },
  {
    path: COLOR_PAGE_ROUTE,
    component: Color,
  },
  {
    path: SIDE_BAR_PAGE_ROUTE,
    component: SideBarPage,
  },

  // Created route for project:

  // this base route should be at the end of all other routes
  { path: "/", exact: true, component: () => <Redirect to="/dashboard" /> },
];

const authRoutes = [
  { path: LOGOUT_ROUTE, component: Logout },
  { path: LOGIN_ROUTE, component: Login },
];

export { userRoutes, authRoutes };
