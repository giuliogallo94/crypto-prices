import { Link, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCoins,
  faStar,
  faComments,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  const menu = [
    { name: "cryptoTable", icon: faChartLine, path: "/cryptoTable" },
    { name: "portfolio", icon: faCoins, path: "/portfolio" },
    { name: "favorites", icon: faStar, path: "/favorites" },
    { name: "blog", icon: faComments, path: "/blog" },
    { name: "settings", icon: faGear, path: "/settings" },
  ];

  const selectedMenuItem = useLocation();

  return (
    <>
      <nav id="sidebar" className="flex-col text-center">
        <ul>
          <Link to="/">
            <li id="logo-side" className="active list-side">
              CW
            </li>
          </Link>
          {menu.map((menuItem) => (
            <Link to={menuItem.name} key={menuItem.name}>
              <li
                className={`list-side ${
                  selectedMenuItem.pathname === menuItem.path ? "active" : ""
                }`}>
                <FontAwesomeIcon icon={menuItem.icon} />
              </li>
            </Link>
          ))}
        </ul>
      </nav>
    </>
  );
}
