import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <div>
        <Navbar />
        <div id="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
