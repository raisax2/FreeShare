import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";

const NotificationsPage = () => {
  const { authData } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_NOTIF_SERVER_URL;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/notifications/${authData.id}`);
        setNotifications(response.data);
      } catch (err) {
        setError("Failed to fetch notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (authData?.id) {
      fetchNotifications();
    }
  }, [API_URL, authData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="p-14 bg-light-pink-orange rounded-lg shadow-xl space-y-6 max-w-2xl w-full mx-4 mt-6">
        <h1 className="text-xl font-bold text-center text-white">Notifications</h1>
        {notifications.length > 0 ? (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 border rounded-lg shadow-sm bg-white`}
              >
                <p className="text-gray-700">{notification.message}</p>
                <p className="text-gray-600 text-sm">
                  Status: {notification.status}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white text-center">No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;