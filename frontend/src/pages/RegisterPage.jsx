import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

export default function RegisterPage() {
  const { register } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmedPassword: "",
    userType: "volunteer",
    fullName: "",
    dob: "",
    description: "", 
    phoneNumber: "",
    organizationName: "",
    address: "", 
    image: null, 
  });
  const [imagePreview, setImagePreview] = useState(null); 
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPasswordsMatch(user.password === user.confirmedPassword);
  }, [user.password, user.confirmedPassword]);

  const onHandleChange = (e) => {
    const { id, value } = e.target;
    setUser((prev) => ({ ...prev, [id]: value }));
  };

  const onHandleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("password", user.password);
    formData.append("description", user.description); 
    if (user.userType === "volunteer") {
      formData.append("fullName", user.fullName);
      formData.append("dob", user.dob);
    } else {
      formData.append("name", user.organizationName);
      formData.append("address", user.address); 
    }
    if (user.image) {
      formData.append("image", user.image);
    }

    try {
      
      const response = await register(user.userType, formData);
      console.log("Signup successful:", response);
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.response?.data?.error || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-pink-orange">
      <div className="p-14 bg-white rounded-lg shadow-xl space-y-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold text-center">Sign up</h2>

        <div className="flex flex-col items-center">
          <label
            htmlFor="image"
            className="relative w-40 h-40 rounded-full border-4 border-light-pink-orange overflow-hidden cursor-pointer"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                Upload Image
              </div>
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onHandleFileChange}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-words-pink-orange mb-2">
            Sign up as
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

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-words-pink-orange">
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
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-words-pink-orange">
            Enter your password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
            value={user.password}
            onChange={onHandleChange}
          />
        </div>

        <div>
          <label htmlFor="confirmedPassword" className="block text-sm font-semibold text-words-pink-orange">
            Confirm your password
          </label>
          <input
            id="confirmedPassword"
            type="password"
            placeholder="Confirm Password"
            className={`border-2 ${
              !passwordsMatch ? "border-red-700" : "border-light-pink-orange"
            } bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500`}
            value={user.confirmedPassword}
            onChange={onHandleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-words-pink-orange">
            Description
          </label>
          <textarea
            id="description"
            placeholder={user.userType === "volunteer" ? "Describe yourself" : "Describe your organization"}
            className="border-2 border-light-pink-orange bg-gray-50 h-20 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
            value={user.description}
            onChange={onHandleChange}
          />
        </div>

        {user.userType === "volunteer" && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-words-pink-orange">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
              value={user.fullName}
              onChange={onHandleChange}
            />
          </div>
        )}

        {user.userType === "volunteer" && (
          <div>
            <label htmlFor="dob" className="block text-sm font-semibold text-words-pink-orange">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
              value={user.dob}
              onChange={onHandleChange}
            />
          </div>
        )}

        {user.userType === "organization" && (
          <>
            <div>
              <label htmlFor="organizationName" className="block text-sm font-semibold text-words-pink-orange">
                Organization Name
              </label>
              <input
                id="organizationName"
                type="text"
                placeholder="Your organization's name"
                className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
                value={user.organizationName}
                onChange={onHandleChange}
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-words-pink-orange">
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Enter your organization's address"
                className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
                value={user.address}
                onChange={onHandleChange}
              />
            </div>
          </>
        )}

        {error && <p className="text-red-700">{error}</p>}

        <button
          type="submit"
          className="bg-pink-orange hover:bg-dark-pink-orange text-white font-bold py-2 px-4 rounded-lg w-full"
          onClick={onHandleSubmit}
        >
          Register
        </button>

        <div className="text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:text-blue-700">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}