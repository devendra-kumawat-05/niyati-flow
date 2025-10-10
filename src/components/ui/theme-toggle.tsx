"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function ThemeToggleSlider() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center w-11 h-5 rounded-full transition-colors duration-300",
        isDark ? "bg-slate-800" : "bg-yellow-300"
      )}
    >
      {/* Icons */}
      <Sun
        className={cn(
          "absolute left-1 h-4 w-4 text-yellow-500 transition-all",
          isDark ? "opacity-0 scale-0" : "opacity-100 scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute right-1 h-4 w-4 text-slate-200 transition-all",
          isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}
      />

      {/* Sliding knob */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md",
          isDark && "translate-x-6"
        )}
      />
    </button>
  )
}
