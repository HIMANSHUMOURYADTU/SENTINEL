import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard, GlassCardContent } from "@/components/ui/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const roles = [
  { id: "agent", label: "AGENT" },
  { id: "admin", label: "ADMIN" },
];

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [role, setRole] = useState<"agent" | "admin">("agent");
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = () => {
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      localStorage.setItem("voicesentinel_selected_role", role);
      await signInWithPopup(auth, googleProvider);
      redirect();
    } catch {
      toast({ title: "Google login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    try {
      setLoading(true);
      localStorage.setItem("voicesentinel_selected_role", role);

      if (tab === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      redirect();
    } catch (err: any) {
      toast({
        title: "Authentication failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <GlassCardContent className="space-y-6 p-6 w-[360px]">
            <div className="text-center space-y-2">
              <Shield className="mx-auto text-primary" />
              <h1 className="text-xl font-display">VOICESENTINEL</h1>
            </div>

            {/* Role */}
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id as any)}
                  className={`border p-2 rounded ${
                    role === r.id ? "border-primary" : "border-border"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="login">LOGIN</TabsTrigger>
                <TabsTrigger value="signup">SIGN UP</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-3">
                <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <Input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleEmailAuth} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="animate-spin" /> : "LOGIN"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3">
                <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <Input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleEmailAuth} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="animate-spin" /> : "CREATE ACCOUNT"}
                </Button>
              </TabsContent>
            </Tabs>

            <Button variant="outline" onClick={handleGoogle} className="w-full">
              CONTINUE WITH GOOGLE
            </Button>
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
