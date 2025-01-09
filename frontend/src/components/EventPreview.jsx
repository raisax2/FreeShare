import React from "react";

const EventPreview = ({
  eventName,
  eventDescription,
  eventDate,
  userType,
  onJoinClick,
  message,
}) => {
  return (
    <div className="bg-light-pink-orange p-6 shadow-lg rounded-lg">
      <h3 className="text-lg font-bold text-white">{eventName}</h3>
      <p className="text-sm text-white mt-2">{eventDescription}</p>
      <p className="text-xs text-white mt-2">{eventDate}</p>

      {message && (
        <p className="text-sm text-white mt-4">{message}</p>
      )}

      {userType === "volunteer" && !message?.toLowerCase().includes("already registered") && (
        <button
          onClick={onJoinClick}
          className="mt-4 bg-white text-pink-orange font-semibold px-4 py-2 rounded shadow hover:bg-gray-100"
        >
          Join
        </button>
      )}
    </div>
  );
};

export default EventPreview;
