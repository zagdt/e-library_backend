"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyEmail } from "@/hooks/useAuth";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { mutate: verifyEmail, isPending, isSuccess } = useVerifyEmail();
    const [manualToken, setManualToken] = useState("");

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token, verifyEmail]);

    const handleManualVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualToken.trim()) {
            verifyEmail(manualToken.trim());
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Email Verified</h1>
                    <p className="text-muted-foreground">Your email has been successfully verified</p>
                </div>
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <p className="text-muted-foreground">
                        You can now sign in to your account with your credentials.
                    </p>
                    <Button onClick={() => router.push("/login")} className="w-full">
                        Continue to Login
                    </Button>
                </div>
            </motion.div>
        );
    }

    if (token) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Verifying Email</h1>
                    <p className="text-muted-foreground">Please wait while we verify your email</p>
                </div>
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                    <p className="text-muted-foreground">Verifying your email address...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
                <p className="text-muted-foreground">We sent you a verification link</p>
            </div>
            <div className="space-y-6">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <Mail className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <p className="text-muted-foreground">
                        Click the link in your email to verify your account. If you don&apos;t see it, check your spam folder.
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or enter code manually</span>
                    </div>
                </div>
                <form onSubmit={handleManualVerify} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="token">Verification Code</Label>
                        <Input
                            id="token"
                            placeholder="Enter verification code"
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending || !manualToken.trim()}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify Email
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
