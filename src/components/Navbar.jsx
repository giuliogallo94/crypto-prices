import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <>
      <nav id="navbar" className="grid grid-cols-3 items-center px-5">
        <div></div>
        <div className="flex justify-center">
          <img src={logo} alt="logo crypto world" />
        </div>
        <button className="text-right">
          <FontAwesomeIcon icon={faUser} />
        </button>
      </nav>
    </>
  );
}
