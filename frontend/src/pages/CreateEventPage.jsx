import React, { useState } from "react";
import axios from "axios";

const CreateEventPage = () => {
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_MAP_API_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const validateAddress = async (address) => {
    try {
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (geocodeResponse.data.status === "OK") {
        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
        return { valid: true, lat, lng };
      } else {
        return { valid: false, message: "Invalid address. Please try again." };
      }
    } catch (err) {
      console.error("Error validating address:", err);
      return { valid: false, message: "Error validating address. Please try again." };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const validationResult = await validateAddress(eventData.address);

      if (!validationResult.valid) {
        setError(validationResult.message);
        setLoading(false);
        return;
      }

      const eventWithCoordinates = {
        ...eventData,
        lat: validationResult.lat,
        lng: validationResult.lng,
      };

      const response = await axios.post(
        `${API_URL}/volunteering/create-event`,
        eventWithCoordinates,
        {
          withCredentials: true,
        }
      );

      setSuccess(response.data.message);
      setEventData({ name: "", description: "", date: "", address: "" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to create event. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Create Event</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Event Name</label>
          <input
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter event name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter event description"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={eventData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter event address"
            required
          />
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-bold rounded ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={loading}
        >
          {loading ? "Creating Event..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage;