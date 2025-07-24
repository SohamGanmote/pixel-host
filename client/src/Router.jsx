import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./pages/Root";
import NotFound from "./pages/NotFound";
import Home from "./pages/home/Home";
import Servers from "./pages/servers/Servers";

const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Home /> },
        { path: "server/:id", element: <Servers /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;