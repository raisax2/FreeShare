import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [user, setUser] = useState({
    email: "",
    password: "",
    userType: "volunteer", 
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function onHandleChange(e) {
    const { id, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [id]: value,
    }));
  }

  const onHandleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(user.email, user.password, user.userType); 
      navigate("/main"); 
    } catch (error) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-pink-orange">
      <div className="p-14 bg-white rounded-lg shadow-xl space-y-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-center">Log In</h2>

        <div>
          <label className="block text-sm font-semibold text-words-pink-orange mb-2">
            Log in as
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                id="userType"
                name="userType"
                value="volunteer"
                checked={user.userType === "volunteer"}
                onChange={onHandleChange}
                className="mr-2"
              />
              Volunteer
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                id="userType"
                name="userType"
                value="organization"
                checked={user.userType === "organization"}
                onChange={onHandleChange}
                className="mr-2"
              />
              Organization
            </label>
          </div>
        </div>

        <label
          htmlFor="email"
          className="block text-sm font-semibold text-words-pink-orange"
        >
          Enter your email
        </label>
        <input
          id="email"
          type="email"
          placeholder="example@mail.com"
          className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
          value={user.email}
          onChange={onHandleChange}
        />

        <label
          htmlFor="password"
          className="block text-sm font-semibold text-words-pink-orange"
        >
          Enter your password
        </label>
        <input
          id="password"
          type="password"
          placeholder="password"
          className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
          value={user.password}
          onChange={onHandleChange}
        />

        {error && <p className="text-red-700">{error}</p>}

        <button
          type="submit"
          className="bg-pink-orange hover:bg-dark-pink-orange text-white font-bold py-2 px-4 rounded-lg w-full"
          onClick={onHandleSubmit}
        >
          Log In
        </button>

        <div className="text-center text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-700">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;