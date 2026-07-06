"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Phone, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/api/use-auth";

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const { sendOtp, isSendingOtp, verifyOtp, isVerifyingOtp } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendOtp(phoneNumber);
      setStep(2);
    } catch {}
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOtp({ phone: phoneNumber, otp });
    } catch {}
  };

  const isLoading = isSendingOtp || isVerifyingOtp;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 mb-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            MK
          </div>
          <CardTitle className="text-2xl font-bold">MK Food Delivery Admin</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? "Enter your phone number to access the dashboard" : `Enter the 6-digit code sent to ${phoneNumber}`}
          </CardDescription>
        </CardHeader>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="+441234567890" className="pl-10"
                    value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required disabled={isLoading} />
                </div>
                <p className="text-[10px] text-muted-foreground">Include country code (e.g., +44 for UK)</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button className="w-full h-11" type="submit" disabled={isLoading}>
                {isSendingOtp ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>) : "Continue"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="otp" type="text" placeholder="123456" maxLength={6}
                    className="pl-10 tracking-[0.5em] text-center font-bold"
                    value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={isLoading} />
                </div>
              </div>
              <div className="flex justify-center">
                <Button type="button" variant="link" className="text-xs font-normal text-muted-foreground"
                  onClick={() => sendOtp(phoneNumber)} disabled={isLoading}>
                  Didn&apos;t receive code? Resend
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 mt-2">
              <Button className="w-full h-11" type="submit" disabled={isLoading}>
                {isVerifyingOtp ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</>) : "Verify & Login"}
              </Button>
              <Button variant="ghost" className="w-full h-11 text-muted-foreground" onClick={() => setStep(1)} disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />Change number
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}