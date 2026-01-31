"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
    const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();
    const [submittedEmail, setSubmittedEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        setSubmittedEmail(data.email);
        forgotPassword(data.email);
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
                    <p className="text-muted-foreground">We sent you a password reset link</p>
                </div>
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-muted-foreground">
                            We&apos;ve sent a password reset link to:
                        </p>
                        <p className="font-medium">{submittedEmail}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
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
                <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
                <p className="text-muted-foreground">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send reset link
                </Button>
            </form>
            <div className="text-center mt-4">
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>
            </div>
        </motion.div>
    );
}
