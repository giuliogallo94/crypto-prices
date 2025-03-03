import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import CryptoTable from "./components/CryptoTable";
import Portfolio from "./components/Portfolio";
import Layout from "./components/Layout";
import Favorites from "./components/Favorites";
import Blog from "./components/Blog";
import Settings from "./components/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <CryptoTable /> },
      { path: "/portfolio", element: <Portfolio /> },
      { path: "/favorites", element: <Favorites /> },
      { path: "/blog", element: <Blog /> },
      { path: "/settings", element: <Settings /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
