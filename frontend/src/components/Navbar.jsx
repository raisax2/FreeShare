import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

const Navbar = () => {
  const { userType, logout } = useContext(AuthContext);

  return (
    <nav className="bg-light-pink-orange p-4 flex justify-between items-center">
      <div className="flex justify-center flex-grow mx-6 space-x-4">
        <Link
          to="/map"
          className="text-white font-bold hover:bg-dark-pink-orange hover:shadow-lg px-4 py-2 rounded transition"
        >
          Map
        </Link>
        {userType === "organization" && (
          <Link
            to="/notifications"
            className="text-white font-bold hover:bg-dark-pink-orange hover:shadow-lg px-4 py-2 rounded transition"
          >
            Notifications
          </Link>
        )}
        <Link
          to="/profile"
          className="text-white font-bold hover:bg-dark-pink-orange hover:shadow-lg px-4 py-2 rounded transition"
        >
          Profile
        </Link>
        <Link
          to="/events"
          className="text-white font-bold hover:bg-dark-pink-orange hover:shadow-lg px-4 py-2 rounded transition"
        >
          Events
        </Link>
        {userType === "organization" && (
          <Link
            to="/create-event"
            className="text-white font-bold hover:bg-dark-pink-orange hover:shadow-lg px-4 py-2 rounded transition"
          >
            Create Event
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;