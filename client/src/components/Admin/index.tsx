import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticlesBackground } from "@/components/particles-background";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useAdminStore } from "@/context/AdminContext";
import { Eye, EyeOff } from "lucide-react"; // Import Eye icons

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();
  const { login } = useAdminStore(); // Access store login action
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setError("");
    
    // Validate input
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    console.log("Email:", email, "Password:", password); // Debugging

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/login`, 
        { email, password },
        { withCredentials: true }
      );
      console.log("Response:", response); // Debugging
      if (response.status === 200) {
        login(response.data.token); // Assuming login is a function that sets user state
        toast.success(response.data.message);
        
        navigate("/codingclubadmin"); // Redirect to homepage
      }
    } catch (error: unknown) {
      const err = error as AxiosError;
      console.error("Login error:", err);

      if (err.response) {
        console.error("Error response data:", err.response.data); // More detailed error logging
        const errorData = err.response.data as { error?: string };
        setError(errorData.error || "Login failed. Please try again.");
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <ParticlesBackground />
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <Button className="w-full text-white" onClick={handleLogin}>Sign In</Button>
        </CardContent>
      </Card>
    </div>
  );
}