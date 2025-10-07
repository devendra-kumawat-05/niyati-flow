"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { ModeToggle } from "@/components/ui/theme-toggle";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <ModeToggle/>
      <Card className="w-[400px]">
        <CardHeader>
          <Image
            src="/logo.png"
            alt="Niyati Flow Logo"
            width={100}
            height={100}
            className="rounded-full mx-auto"
          />
          <CardTitle className="text-center text-2xl">Niyati Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-4 w-full ">
              <TabsTrigger className="cursor-pointer" value="register">
                Register
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="login">
                Login
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onRegistered={() => setTab("login")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
