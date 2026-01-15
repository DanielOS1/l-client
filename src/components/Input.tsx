import React from "react";
import { View, TextInput, Text, TextInputProps } from "react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName,
  className,
  ...props
}: InputProps) {
  return (
    <View className={twMerge("mb-4", containerClassName)}>
      {label && (
        <Text className="text-gray-700 font-medium mb-1.5 ml-1">{label}</Text>
      )}
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={twMerge(
          "w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900",
          "focus:border-blue-500 focus:bg-white",
          error && "border-red-500 bg-red-50",
          className
        )}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
    </View>
  );
}
