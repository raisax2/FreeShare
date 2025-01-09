import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { userType, authData, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        let endpoint =
          userType === "volunteer"
            ? `${API_URL}/users/get_user_by_id/${authData.id}`
            : `${API_URL}/organizations/get_org_by_id/${authData.id}`;

        const response = await axios.get(endpoint, { withCredentials: true });
        setProfileData(response.data.user || response.data); 
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userType && authData?.id) loadProfile();
  }, [userType, authData, API_URL]);

  const handleLogout = async () => {
    try {
      await logout(userType);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-pink-orange">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="p-14 bg-light-pink-orange rounded-lg shadow-xl space-y-6 max-w-2xl w-full mx-4">
        <h1 className="text-xl font-bold text-center text-white">Profile</h1>
        {profileData?.image && (
          <div className="flex justify-center">
            <img
              src={`data:image/jpeg;base64,${profileData.image}`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white"
            />
          </div>
        )}
        {userType === "volunteer" && profileData && (
          <div className="space-y-2 text-white">
            <p>
              <strong>Email:</strong> {profileData.email}
            </p>
            <p>
              <strong>Full Name:</strong> {profileData.fullName}
            </p>
            <p>
              <strong>Date of Birth:</strong> {profileData.dob}
            </p>
            <p>
              <strong>Description:</strong> {profileData.description}
            </p>
          </div>
        )}
        {userType === "organization" && profileData && (
          <div className="space-y-2 text-white">
            <p>
              <strong>Name:</strong> {profileData.name}
            </p>
            <p>
              <strong>Email:</strong> {profileData.email}
            </p>
            <p>
              <strong>Address:</strong> {profileData.address}
            </p>
            <p>
              <strong>Description:</strong> {profileData.description}
            </p>
          </div>
        )}
        <button
          className="bg-white hover:bg-gray-100 text-pink-orange font-bold py-2 px-4 rounded-lg w-full"
          onClick={() => navigate("/edit-profile")}
        >
          Edit Profile
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg w-full"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;