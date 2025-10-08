"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface RegisterResponse {
  message?: string;
  success?: boolean;
}

type RegisterFormProps = {
  onRegistered?: () => void;
};

export default function RegisterForm({ onRegistered }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post<RegisterResponse>("/api/register", formData);

      toast.success(res.data?.message || "Registration successful!");
      onRegistered?.();
      // router.push("/login"); // redirect to login
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <Label className="mb-1">Name</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label className="mb-1">Email</Label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label className="mb-1">Password</Label>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full cursor-pointer bg-[#ffb34e]"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
