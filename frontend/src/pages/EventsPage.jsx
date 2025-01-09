import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";

const EventsPage = () => {
  const { userType, authData } = useContext(AuthContext);
  const [events, setEvents] = useState({ past_events: [], upcoming_events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewUpcoming, setViewUpcoming] = useState(true); 

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const endpoint =
          userType === "volunteer"
            ? `${API_URL}/users/get_my_events`
            : `${API_URL}/organizations/get_my_events`;

        const response = await axios.get(endpoint, { withCredentials: true });
        setEvents(response.data); 
      } catch (err) {
        setError("An unexpected error occurred while fetching events.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userType && authData?.id) {
      fetchEvents();
    }
  }, [userType, authData, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-pink-orange">Loading...</p>
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

  const displayedEvents = viewUpcoming ? events.upcoming_events : events.past_events;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="p-14 bg-light-pink-orange rounded-lg shadow-xl space-y-6 max-w-4xl w-full mx-4">
        <h1 className="text-xl font-bold text-center text-white">Your Events</h1>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              viewUpcoming ? "bg-white text-pink-orange" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setViewUpcoming(true)}
          >
            Upcoming Events
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              !viewUpcoming ? "bg-white text-pink-orange" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setViewUpcoming(false)}
          >
            Past Events
          </button>
        </div>
        {displayedEvents.length > 0 ? (
          <ul className="space-y-4">
            {displayedEvents.map((event) => (
              <li
                key={event.id}
                className="p-4 border rounded-lg shadow-sm bg-white text-pink-orange"
              >
                <h3 className="font-semibold text-lg">{event.name}</h3>
                <p className="text-gray-600">{event.date}</p>
                <p className="mt-2">{event.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-white">No events found.</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;