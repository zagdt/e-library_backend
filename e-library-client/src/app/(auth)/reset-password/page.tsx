"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/useAuth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { mutate: resetPassword, isPending } = useResetPassword();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (token) {
            setValue("token", token);
        }
    }, [token, setValue]);

    const onSubmit = (data: ResetPasswordFormData) => {
        resetPassword({
            token: data.token,
            password: data.password,
        });
    };

    if (!token) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Invalid Reset Link</h1>
                    <p className="text-muted-foreground">The password reset link is invalid or expired</p>
                </div>
                <div className="text-center space-y-6">
                    <p className="text-muted-foreground">
                        Please request a new password reset link.
                    </p>
                    <div className="space-y-2">
                        <Button asChild className="w-full">
                            <Link href="/forgot-password">Request New Link</Link>
                        </Button>
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Link>
                    </div>
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
                <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
                <p className="text-muted-foreground">Enter your new password below</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register("token")} />
                <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        {...register("password")}
                        className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        {...register("confirmPassword")}
                        className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset password
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
