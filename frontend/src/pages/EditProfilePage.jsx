import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "axios";

export default function EditProfilePage() {
  const { userType, authData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    description: "",
    fullName: "",
    organizationName: "",
    address: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const endpoint =
          userType === "volunteer"
            ? `${API_URL}/users/get_user_by_id/${authData.id}`
            : `${API_URL}/organizations/get_org_by_id/${authData.id}`;
        const response = await axios.get(endpoint, { withCredentials: true });
        const data = response.data.user || response.data;

        setUser((prev) => ({
          ...prev,
          description: data.description || "",
          fullName: data.fullName || "",
          organizationName: data.name || "",
          address: data.address || "",
        }));

        if (data.image) setImagePreview(`data:image/jpeg;base64,${data.image}`);
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      }
    };

    loadProfile();
  }, [API_URL, userType, authData]);

  const onHandleChange = (e) => {
    const { id, value } = e.target;
    setUser((prev) => ({ ...prev, [id]: value }));
  };

  const onHandleFileChange = (e) => {
    const file = e.target.files[0];
    setUser((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("description", user.description);
    if (userType === "volunteer") {
      formData.append("fullName", user.fullName);
    } else {
      formData.append("name", user.organizationName);
      formData.append("address", user.address);
    }

    if (user.image) formData.append("image", user.image);

    try {
      const endpoint =
        userType === "volunteer"
          ? `${API_URL}/users/update_profile`
          : `${API_URL}/organizations/update_org`;

      await axios.put(endpoint, formData, { withCredentials: true });
      navigate("/profile");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-pink-orange">
      <div className="p-14 bg-white rounded-lg shadow-xl space-y-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold text-center">Edit Profile</h2>

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
          <label htmlFor="description" className="block text-sm font-semibold text-words-pink-orange">
            Description
          </label>
          <textarea
            id="description"
            placeholder={userType === "volunteer" ? "Describe yourself" : "Describe your organization"}
            className="border-2 border-light-pink-orange bg-gray-50 h-20 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
            value={user.description}
            onChange={onHandleChange}
          />
        </div>

        {userType === "volunteer" && (
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

        {userType === "organization" && (
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
                placeholder="Enter your address"
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
          Save Changes
        </button>

        <div className="text-center text-gray-500 mt-4">
          <Link to="/profile" className="text-blue-500 hover:text-blue-700">
            Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
