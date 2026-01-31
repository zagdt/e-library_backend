// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useSignup } from "@/hooks/useAuth";
// import { useAuthStore } from "@/stores/authStore";
// import { signupSchema, type SignupFormData } from "@/schemas/auth";
// import { Loader2 } from "lucide-react";
// import { motion } from "framer-motion";

// export default function SignupPage() {
//     const router = useRouter();
//     const { isAuthenticated } = useAuthStore();
//     const { mutate: signup, isPending } = useSignup();

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//     } = useForm<SignupFormData>({
//         resolver: zodResolver(signupSchema),
//     });

//     useEffect(() => {
//         if (isAuthenticated) {
//             router.replace("/dashboard");
//         }
//     }, [isAuthenticated, router]);

//     const onSubmit = (data: SignupFormData) => {
//         signup({
//             email: data.email,
//             password: data.password,
//             firstName: data.firstName,
//             lastName: data.lastName,
//         });
//     };

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//         >
//             <div className="text-center space-y-2 mb-8">
//                 <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
//                 <p className="text-muted-foreground">Enter your details to get started</p>

//                 <div className="bg-muted/50 p-4 rounded-lg text-sm text-left space-y-2 mt-4">
//                     <p className="font-semibold text-muted-foreground">Please use your school email:</p>
//                     <ul className="space-y-1 text-xs text-muted-foreground/80 list-disc list-inside">
//                         <li>Students: <span className="font-mono text-primary">example@vu.sc.ug</span></li>
//                         <li>Staff: <span className="font-mono text-primary">example@vu.sa.ug</span></li>
//                         <li>Admins: <span className="font-mono text-primary">example@vu.admin.ug</span></li>
//                     </ul>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                         <Label htmlFor="firstName">First name</Label>
//                         <Input
//                             id="firstName"
//                             placeholder="John"
//                             {...register("firstName")}
//                             className={errors.firstName ? "border-destructive" : ""}
//                         />
//                         {errors.firstName && (
//                             <p className="text-sm text-destructive">{errors.firstName.message}</p>
//                         )}
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="lastName">Last name</Label>
//                         <Input
//                             id="lastName"
//                             placeholder="Doe"
//                             {...register("lastName")}
//                             className={errors.lastName ? "border-destructive" : ""}
//                         />
//                         {errors.lastName && (
//                             <p className="text-sm text-destructive">{errors.lastName.message}</p>
//                         )}
//                     </div>
//                 </div>
//                 <div className="space-y-2">
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                         id="email"
//                         type="email"
//                         placeholder="name@example.com"
//                         {...register("email")}
//                         className={errors.email ? "border-destructive" : ""}
//                     />
//                     {errors.email && (
//                         <p className="text-sm text-destructive">{errors.email.message}</p>
//                     )}
//                 </div>
//                 <div className="space-y-2">
//                     <Label htmlFor="password">Password</Label>
//                     <Input
//                         id="password"
//                         type="password"
//                         placeholder="Create a password"
//                         {...register("password")}
//                         className={errors.password ? "border-destructive" : ""}
//                     />
//                     {errors.password && (
//                         <p className="text-sm text-destructive">{errors.password.message}</p>
//                     )}
//                 </div>
//                 <div className="space-y-2">
//                     <Label htmlFor="confirmPassword">Confirm password</Label>
//                     <Input
//                         id="confirmPassword"
//                         type="password"
//                         placeholder="Confirm your password"
//                         {...register("confirmPassword")}
//                         className={errors.confirmPassword ? "border-destructive" : ""}
//                     />
//                     {errors.confirmPassword && (
//                         <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
//                     )}
//                 </div>
//                 <Button type="submit" className="w-full" disabled={isPending}>
//                     {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Create account
//                 </Button>
//             </form>
//             <div className="text-center text-sm mt-4">
//                 Already have an account?{" "}
//                 <Link href="/login" className="text-primary hover:underline font-medium">
//                     Sign in
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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSignup } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { signupSchema, type SignupFormData } from "@/schemas/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { mutate: signup, isPending } = useSignup();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, router]);

    const onSubmit = (data: SignupFormData) => {
        if (!acceptedTerms) {
            return;
        }
        signup({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-start">Sign Up</h1>
                <p className="text-muted-foreground text-start">Enter your details to get started</p>

                <div className="bg-muted/50 p-4 rounded-lg text-sm text-left space-y-2 mt-4">
                    <p className="font-semibold text-muted-foreground">Please use your school email:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground/80 list-disc list-inside">
                        <li>Students: <span className="font-mono text-primary">example@vu.sc.ug</span></li>
                        <li>Staff: <span className="font-mono text-primary">example@vu.sa.ug</span></li>
                        <li>Admins: <span className="font-mono text-primary">example@vu.admin.ug</span></li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            id="firstName"
                            placeholder="John"
                            {...register("firstName")}
                            className={errors.firstName ? "border-destructive py-5" : "py-5"}
                            autoComplete="given-name"
                        />
                        {errors.firstName && (
                            <p className="text-sm text-destructive">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            placeholder="Doe"
                            {...register("lastName")}
                            className={errors.lastName ? "border-destructive py-5" : "py-5"}
                            autoComplete="family-name"
                        />
                        {errors.lastName && (
                            <p className="text-sm text-destructive">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

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
                            placeholder="Create a password"
                            {...register("password")}
                            className={`pr-10 ${errors.password ? "border-destructive py-5" : "py-5"}`}
                            autoComplete="new-password"
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

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...register("confirmPassword")}
                            className={`pr-10 ${errors.confirmPassword ? "border-destructive py-5" : "py-5"}`}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        className="mt-1"
                    />
                    <label
                        htmlFor="terms"
                        className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        By creating an account means you agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                            Terms and Conditions
                        </Link>
                        , and our{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </label>
                </div>

                <Button 
                    type="submit" 
                    className="w-full py-5" 
                    disabled={isPending || !acceptedTerms}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                </Button>
            </form>

            <div className="text-start text-sm mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                </Link>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border/50">
                <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Victoria University. All rights reserved.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}