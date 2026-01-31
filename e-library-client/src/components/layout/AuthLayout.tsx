import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/90 to-primary items-center justify-center p-12"
           style={{
             backgroundImage: 'url("https://s3.us-east-1.amazonaws.com/victoria-university-elearning/website/images/gallery/9c0cab63-6a96-427c-bfd1-b0d81cea9f47.jpg")',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat'
           }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary"></div>
        <div className="relative max-w-md text-white space-y-6 z-10">
          <div className="flex items-center gap-3">
            <div className="p-0.5">
              <img src="/vu-logo.png" alt="VU Logo" className="h-28 w-28 object-contain" />
            </div>
            <span className="text-2xl font-bold">VU ResourceHub</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Your one-stop platform for educational resources
          </h2>
          <p className="text-white/90 text-lg">
            Access lecture notes, past exams, tutorials, and more. Collaborate with peers and enhance your learning experience.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[
                "https://s3.us-east-1.amazonaws.com/victoria-university-elearning/website/images/gallery/d5388283-5184-4788-8241-88a4f8f71206.jpg",
                "https://s3.us-east-1.amazonaws.com/victoria-university-elearning/website/images/gallery/7fe40b89-b282-46e5-af6f-a8cbe984b147.jpg",
                "https://s3.us-east-1.amazonaws.com/victoria-university-elearning/website/images/gallery/d3da269f-988e-412e-b540-26e9bb809e63.jpg",
                "https://s3.us-east-1.amazonaws.com/victoria-university-elearning/website/images/gallery/e933cce8-5df7-4a63-92b3-ca02476db0bc.jpg"
              ].map((imageUrl, i) => (
                <img
                  key={i}
                  src={imageUrl}
                  alt={`Student ${i + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover"
                />
              ))}
            </div>
            <span className="text-white">Join 10,000+ students</span>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center justify-center">
            <img src="/vu-logo.png" alt="VU Logo" className="h-36 w-36 object-contain" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
