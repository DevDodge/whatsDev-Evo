import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@evoapi/design-system/alert";
import { Button } from "@evoapi/design-system/button";
import { Input } from "@/components/ui/input";
import { Label } from "@evoapi/design-system/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { useTheme } from "@/components/theme-provider";

import { DEFAULT_PROVIDER, saveToken } from "@/lib/queries/token";

const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});
type LoginSchema = z.infer<typeof loginSchema>;

// Hardcoded credentials
// Hardcoded credentials
const VALID_EMAIL = "octobotchatbot@gmail.com";
const VALID_PASSWORD = "Eng.DodgeMasr.Octobot.12";
const API_KEY = "B6D9F1C3-4E8A-4F2B-9C5D-7A3E1B4F6C8D";
const SERVER_URL = import.meta.env.VITE_EVOLUTION_API_URL || "https://dk.whatsdeveloper.com/evolution";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const logoSrc =
    theme === "dark"
      ? "https://evolution-api.com/files/evo/evolution-logo-white.svg"
      : "https://evolution-api.com/files/evo/evolution-logo.svg";

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin: SubmitHandler<LoginSchema> = async (data) => {
    setSubmitting(true);
    setLoginError("");

    try {
      // Simple email/password validation
      if (data.email === VALID_EMAIL && data.password === VALID_PASSWORD) {
        // Save token with hardcoded values
        saveToken({
          version: "2.3.7",
          clientName: "evolution",
          url: SERVER_URL,
          token: API_KEY,
          provider: DEFAULT_PROVIDER,
        });
        navigate("/manager/");
      } else {
        const msg = "Invalid email or password";
        loginForm.setError("password", { type: "manual", message: msg });
        setLoginError(msg);
      }
    } catch (err) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const errors = loginForm.formState.errors;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-t from-primary/20 via-background/95 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <img src={logoSrc} alt="Evolution API" className="mb-3 h-10" />
          <p className="text-sm text-muted-foreground">{t("login.description")}</p>
        </div>

        <div className="rounded-lg border bg-background/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-bold">WhatsDeveloper Manager</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the system
            </p>
          </div>

          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">
                  Email <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  disabled={submitting}
                  {...loginForm.register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">
                  Password <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Your password"
                  disabled={submitting}
                  {...loginForm.register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Evolution API ·{" "}
            <a href="https://docs.evolutionfoundation.com.br/" target="_blank" rel="noreferrer" className="underline hover:text-primary">
              Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
