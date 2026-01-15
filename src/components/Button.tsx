import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from "react-native";
import { clsx } from "clsx";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  className?: string; // For Tailwind class merging
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = "primary",
  isLoading = false,
  className,
  icon,
  ...props
}: ButtonProps) {
  const baseStyles =
    "h-14 rounded-2xl flex-row items-center justify-center px-4";

  const variants = {
    primary: "bg-blue-600 active:bg-blue-700",
    secondary: "bg-slate-200 active:bg-slate-300",
    outline: "bg-transparent border-2 border-slate-200 active:bg-slate-50",
    ghost: "bg-transparent active:bg-slate-100",
  };

  const textStyles = {
    primary: "text-white font-bold text-lg",
    secondary: "text-slate-700 font-bold text-lg",
    outline: "text-slate-600 font-bold text-lg",
    ghost: "text-blue-600 font-semibold text-base",
  };

  return (
    <TouchableOpacity
      className={clsx(
        baseStyles,
        variants[variant],
        props.disabled && "opacity-50",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "white" : "#475569"}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={textStyles[variant]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
