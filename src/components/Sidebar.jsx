import { useState, useEffect } from "react";
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
    // { name: "cryptoTable", icon: faChartLine, path: "/" },
    { name: "portfolio", icon: faCoins, path: "/portfolio" },
    { name: "favorites", icon: faStar, path: "/favorites" },
    // { name: "blog", icon: faComments, path: "/blog" },
    // { name: "settings", icon: faGear, path: "/settings" },
  ];
  const selectedMenuItem = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const checkToken = () => {
      setToken(localStorage.getItem("token"));
    };

    checkToken(); // 🔄 Controlla subito

    // 🔥 Rileva cambiamenti su localStorage
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  return (
    <>
      <nav id="sidebar" className="flex-col text-center">
        <ul>
            <li id="logo-side" className="active list-side">
              CW
            </li>
          <Link to="/">
          <li className={`list-side ${
                  selectedMenuItem.pathname === '/' ? "active" : ""
                }`}>
                <FontAwesomeIcon icon={faChartLine} />
          </li>
          </Link>
          <Link to="/news">
          <li className={`list-side ${
                  selectedMenuItem.pathname === '/news' ? "active" : ""
                }`}>
                <FontAwesomeIcon icon={faComments} />
          </li>
          </Link>

          {token && menu.map((menuItem) => (
            <Link to={menuItem.path} key={menuItem.name}>
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
