import React, { useState } from "react";
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from "react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Texto de ayuda persistente bajo el campo (formato esperado, requisitos, etc). Se oculta si hay `error`. */
  helperText?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helperText,
  containerClassName,
  className,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const canToggleReveal = !!secureTextEntry;

  return (
    <View className={twMerge("mb-4", containerClassName)}>
      {label && (
        <Text className="text-gray-700 font-medium mb-1.5 ml-1">{label}</Text>
      )}
      <View className="justify-center">
        <TextInput
          placeholderTextColor="#9CA3AF"
          secureTextEntry={canToggleReveal ? !isRevealed : secureTextEntry}
          className={twMerge(
            "w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-gray-900",
            "focus:border-brand-teal focus:bg-white",
            canToggleReveal && "pr-12",
            error && "border-red-500 bg-red-50",
            className
          )}
          {...props}
        />
        {canToggleReveal && (
          <TouchableOpacity
            onPress={() => setIsRevealed((v) => !v)}
            hitSlop={10}
            className="absolute right-4"
          >
            {isRevealed ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
      ) : helperText ? (
        <Text className="text-gray-400 text-xs mt-1 ml-1">{helperText}</Text>
      ) : null}
    </View>
  );
}
