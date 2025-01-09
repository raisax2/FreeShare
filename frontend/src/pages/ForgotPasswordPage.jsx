import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-pink-orange">
      <div className="p-14 bg-white rounded-lg shadow-xl space-y-6 max-w-2xl w-full mx-4">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-words-pink-orange"
        >
          Enter your email
        </label>
        <input
          id="email"
          placeholder="enter your email"
          className="border-2 border-light-pink-orange bg-gray-50 h-10 px-5 rounded-lg text-sm focus:outline-none w-full placeholder-gray-500"
          type="email"
          onChange={(event) => setEmail(event.target.value)}
          value={email}
        />
        <div>
          <Link to="/login">
            <button
              className="bg-pink-orange hover:bg-dark-pink-orange rounded-lg py-2 px-4 font-bold w-full text-white"
              type="submit"
            >
              submit
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}