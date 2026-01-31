// "use client";

// import { useEffect, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useLogin } from "@/hooks/useAuth";
// import { useAuthStore } from "@/stores/authStore";
// import { loginSchema, type LoginFormData } from "@/schemas/auth";
// import { Loader2 } from "lucide-react";
// import { motion } from "framer-motion";

// function LoginForm() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const { isAuthenticated } = useAuthStore();
//     const { mutate: login, isPending } = useLogin();

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<LoginFormData>({
//         resolver: zodResolver(loginSchema),
//     });

//     useEffect(() => {
//         if (isAuthenticated) {
//             const redirectTo = searchParams?.get("redirect") || "/dashboard";
//             router.replace(redirectTo);
//         }
//     }, [isAuthenticated, router, searchParams]);

//     const onSubmit = (data: LoginFormData) => {
//         login(data);
//     };

//     return (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div className="space-y-3">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                     id="email"
//                     type="email"
//                     placeholder="name@example.com"
//                     {...register("email")}
//                     className={errors.email ? "border-destructive" : ""}
//                 />
//                 {errors.email && (
//                     <p className="text-sm text-destructive">{errors.email.message}</p>
//                 )}
//             </div>
//             <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                     <Label htmlFor="password">Password</Label>
//                     <Link
//                         href="/forgot-password"
//                         className="text-sm text-primary hover:underline"
//                     >
//                         Forgot password?
//                     </Link>
//                 </div>
//                 <Input
//                     id="password"
//                     type="password"
//                     placeholder="Enter your password"
//                     {...register("password")}
//                     className={errors.password ? "border-destructive" : ""}
//                 />
//                 {errors.password && (
//                     <p className="text-sm text-destructive">{errors.password.message}</p>
//                 )}
//             </div>
//             <Button type="submit" className="w-full" disabled={isPending}>
//                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Sign in
//             </Button>
//         </form>
//     );
// }

// export default function LoginPage() {
//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//         >
//             <div className="text-center space-y-2 mb-8">
//                 <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
//                 <p className="text-muted-foreground">Enter your credentials to access your account</p>

//                 <div className="bg-muted/50 p-4 rounded-lg text-sm text-left space-y-2 mt-4">
//                     <p className="font-semibold text-muted-foreground">Please use your school email:</p>
//                     <ul className="space-y-1 text-xs text-muted-foreground/80 list-disc list-inside">
//                         <li>Students: <span className="font-mono text-primary">example@vu.sc.ug</span></li>
//                         <li>Staff: <span className="font-mono text-primary">example@vu.sa.ug</span></li>
//                         <li>Admins: <span className="font-mono text-primary">example@vu.admin.ug</span></li>
//                     </ul>
//                 </div>
//             </div>

//             <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}>
//                 <LoginForm />
//             </Suspense>

//             <div className="text-center text-sm mt-4">
//                 Don&apos;t have an account?{" "}
//                 <Link href="/signup" className="text-primary hover:underline font-medium">
//                     Sign up
//                 </Link>
//             </div>

//             {/* Footer */}
//             <div className="mt-8 pt-6 border-t border-border/50">
//                 <div className="text-center space-y-2">
//                     <p className="text-xs text-muted-foreground">
//                         © {new Date().getFullYear()} Victoria University. All rights reserved.
//                     </p>
//                     <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
//                         <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
//                         <span>•</span>
//                         <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
//                         <span>•</span>
//                         <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
//                     </div>
//                 </div>
//             </div>
//         </motion.div>
//     );
// }

"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    const { mutate: login, isPending } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const [stayLoggedIn, setStayLoggedIn] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            const redirectTo = searchParams?.get("redirect") || "/dashboard";
            router.replace(redirectTo);
        }
    }, [isAuthenticated, router, searchParams]);

    const onSubmit = (data: LoginFormData) => {
        login({ ...data, stayLoggedIn });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive py-5" : "py-5"}
                    autoComplete="email"
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...register("password")}
                        className={`pr-10 ${errors.password ? "border-destructive py-5" : "py-5"}`}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="stayLoggedIn"
                        checked={stayLoggedIn}
                        onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
                    />
                    <label
                        htmlFor="stayLoggedIn"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Stay logged in
                    </label>
                </div>
                <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                >
                    Forgot password?
                </Link>
            </div>

            <Button type="submit" className="w-full py-5" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
            </Button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground">Enter your credentials to access your account</p>

                <div className="bg-muted/50 p-4 rounded-lg text-sm text-left space-y-2 mt-4">
                    <p className="font-semibold text-muted-foreground">Please use your school email:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground/80 list-disc list-inside">
                        <li>Students: <span className="font-mono text-primary">example@vu.sc.ug</span></li>
                        <li>Staff: <span className="font-mono text-primary">example@vu.sa.ug</span></li>
                        <li>Admins: <span className="font-mono text-primary">example@vu.admin.ug</span></li>
                    </ul>
                </div>
            </div>

            <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}>
                <LoginForm />
            </Suspense>

            <div className="text-center text-sm mt-4">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-border/50">
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <span>•</span>
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <span>•</span>
                        <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Victoria University. All rights reserved.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}