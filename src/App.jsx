import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import CryptoTable from "./components/CryptoTable";
import Portfolio from "./components/Portfolio";
import Layout from "./components/Layout";
import Favorites from "./components/Favorites";
import News from "./components/News";
import Settings from "./components/Settings";
import SingleCoinView from "./components/SingleCoinView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <CryptoTable /> },
      { path: "/portfolio", element: <Portfolio /> },
      { path: "/favorites", element: <Favorites /> },
      { path: "/news", element: <News /> },
      { path: "/settings", element: <Settings /> },
      { path: "/crypto/:coinId", element: <SingleCoinView />}
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
