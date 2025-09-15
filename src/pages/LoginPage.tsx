import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerifyOtp = () => {
    if (otp === "123456") {
      toast.success("Successfully logged in");
      navigate("/dashboard");
    } else {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Marketing Automation
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Secure login with OTP
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center border rounded-md px-3 py-2 bg-white">
            <Lock className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              type="text"
              placeholder="Enter OTP (e.g. 123456)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button onClick={handleVerifyOtp} className="w-full">
            Verify & Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
