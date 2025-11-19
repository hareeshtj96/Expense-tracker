import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errs.email = "Please enter a valid email.";

    if (!formData.password.trim()) errs.password = "Password is required.";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Invalid credentials!");
        setIsSubmitting(false);
        return;
      }

      toast.success("Login Successful!");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error while login:", error);
      toast.error("Error occured while logging in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          <div className="text-center mb-6">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4 shadow-sm">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Login to your account
              </p>
            </div>

            <form className="space-y-5 mt-2" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all duration-200
                ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-200 focus:border-gray-900"
                }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all duration-200 pr-12 ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-200 focus:border-gray-900"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 px-6 py-3.5 bg-gray-900 text-white font-semibold rounded-xl shadow-sm hover:bg-gray-800 disabled:opacity-55"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className="text-center mt-6 text-gray-500 text-sm">
              Don’t have an account?{" "}
              <a
                href="/"
                className="text-gray-900 hover:text-gray-700 font-medium"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
