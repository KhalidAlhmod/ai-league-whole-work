
import { useState } from "react";
import { Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    full_name: z.string().min(2, "Full name is required"),
    is_local: z.boolean(),
    national_id: z.string().optional(),
    visa_id: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    team_supported: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })
  .refine(
    (data) => {
      if (data.is_local) {
        return !!data.national_id;
      }
      return true;
    },
    {
      message: "National ID is required for local users",
      path: ["national_id"],
    }
  )
  .refine(
    (data) => {
      if (!data.is_local) {
        return !!data.visa_id;
      }
      return true;
    },
    {
      message: "Visa ID is required for international users",
      path: ["visa_id"],
    }
  );

export type SignupFormValues = z.infer<typeof formSchema>;

const Signup = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Teams list (could come from API)
  const teams = [
    "Al-Ahli",
    "Al-Nassr",
    "Al-Hilal",
    "Al-Ittihad",
    "Al-Shabab",
    "Al-Ettifaq",
    "Al-Taawoun",
    "Other",
  ];

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      is_local: true,
      national_id: "",
      visa_id: "",
      email: "",
      phone: "",
      team_supported: "",
      password: "",
      confirm_password: "",
    },
  });

  const { watch, setValue } = form;
  const isLocal = watch("is_local");

  const onSubmit = async (values: SignupFormValues) => {
    try {
      setLoading(true);
      
      // Remove the confirm_password field which isn't needed for the API
      const { confirm_password, ...userData } = values;
      
      // Ensure all required fields have values to satisfy TypeScript
      await signUp({
        full_name: userData.full_name,
        email: userData.email,
        is_local: userData.is_local,
        phone: userData.phone,
        national_id: userData.national_id,
        visa_id: userData.visa_id,
        team_supported: userData.team_supported,
        password: userData.password,
      });
      
      form.reset();
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: error.message || "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-lg">
          <div className="flex justify-center mb-4">
            <Ticket className="h-10 w-10 text-brand-teal" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-center text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-brand-teal hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2 mb-4">
                  <FormField
                    control={form.control}
                    name="is_local"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Residency Status</FormLabel>
                        </div>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className={isLocal ? "text-muted-foreground" : "font-medium"}>International</span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  setValue("visa_id", "");
                                } else {
                                  setValue("national_id", "");
                                }
                              }}
                            />
                            <span className={!isLocal ? "text-muted-foreground" : "font-medium"}>Local</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {isLocal ? (
                  <FormField
                    control={form.control}
                    name="national_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID</FormLabel>
                        <FormControl>
                          <Input placeholder="1000000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="visa_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa ID</FormLabel>
                        <FormControl>
                          <Input placeholder="V1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="team_supported"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Team (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
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
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
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

export default Signup;
