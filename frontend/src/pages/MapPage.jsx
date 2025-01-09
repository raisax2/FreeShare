import React, { useState, useEffect, useContext } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import axios from "axios";
import EventPreview from "../components/EventPreview";
import { AuthContext } from "../context/authContext";

const MapPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearestEvents, setNearestEvents] = useState([]);
  const [eventMessages, setEventMessages] = useState({}); 

  const { userType } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL;
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_MAP_API_KEY;

  const center = currentLocation || { lat: 40.7128, lng: -74.006 }; 

  useEffect(() => {
    const fetchLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          await fetchNearestEvents(latitude, longitude);
        },
        (error) => console.error("Error fetching location:", error)
      );
    };

    const fetchNearestEvents = async (lat, lng) => {
      try {
        const response = await axios.get(`${API_URL}/volunteering/nearest-events`, {
          params: { lat, lng },
          withCredentials: true, 
        });
        setNearestEvents(response.data);
      } catch (error) {
        console.error("Error fetching nearest events:", error);
      }
    };

    fetchLocation();
  }, [API_URL]);

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await axios.post(
        `${API_URL}volunteering/register-for-event/${eventId}/register`,
        {},
        { withCredentials: true } 
      );
      setEventMessages((prev) => ({
        ...prev,
        [eventId]: response.data.message || "Successfully joined the event.",
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to join the event. Please try again.";
      setEventMessages((prev) => ({
        ...prev,
        [eventId]: errorMessage,
      }));
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-0 bottom-[40px] w-full h-[calc(100vh-60px)]">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerClassName="w-full h-full"
            center={center}
            zoom={12}
          >
            {currentLocation && (
              <Marker
                position={currentLocation}
                title="Your Location"
              />
            )}

            {nearestEvents.map((event) => (
              <Marker
                key={event.id}
                position={{ lat: event.lat, lng: event.lng }}
                onClick={() => setSelectedEvent(event)}
              />
            ))}

            {selectedEvent && (
              <InfoWindow
                position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
                onCloseClick={() => setSelectedEvent(null)}
              >
                <EventPreview
                  eventName={selectedEvent.name}
                  eventDescription={selectedEvent.description}
                  eventDate={selectedEvent.date}
                  userType={userType}
                  onJoinClick={() => handleJoinEvent(selectedEvent.id)}
                  message={eventMessages[selectedEvent.id]} 
                />
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default MapPage;