import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext)
  const navigate = useNavigate();
  // Handle login logic here
  const handleLogin = async (e) => {
    e.preventDefault();


    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setError("");

    // login api call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }

  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-screen flex flex-col justify-center items-center px-6">
        <h3 className="text-2xl font-semibold text-black mb-2">Welcome Back</h3>
        <p className="text-sm text-slate-700 mb-6">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="At least 8 characters"
            type="password"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-md hover:bg-blue-700 transition"
          >
            LOGIN
          </button>

          <p className="text-sm text-center text-slate-800">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 underline"
            >
              SignUp
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
