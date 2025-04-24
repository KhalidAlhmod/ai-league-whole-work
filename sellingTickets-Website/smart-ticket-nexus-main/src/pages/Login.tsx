
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null; // Return null to prevent rendering the rest of the component
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setLoginError(null);
      setLoading(true);
      await signIn(data.email, data.password);
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Invalid login credentials");
      // Error is already handled by the signIn function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <Ticket className="h-10 w-10 text-brand-teal" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-center text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-brand-teal hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>

          <div className="mt-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-600 rounded-md text-sm">
                    {loginError}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-brand-teal hover:bg-brand-teal/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loader mr-2"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600">
          <div className="flex flex-col items-center justify-center h-full px-8">
            <Ticket className="h-20 w-20 text-white mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">SmartTicket</h2>
            <p className="text-xl text-white text-center">
              Your secure platform for purchasing and managing event tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
