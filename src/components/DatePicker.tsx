import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Button } from "./Button";
import { Calendar as CalendarIcon, X } from "lucide-react-native";

// Configure Spanish Locale
LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene.",
    "Feb.",
    "Mar.",
    "Abr.",
    "May.",
    "Jun.",
    "Jul.",
    "Ago.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dic.",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

interface DatePickerProps {
  label: string;
  value: string;
  onDateSelect: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export function DatePicker({
  label,
  value,
  onDateSelect,
  placeholder = "Seleccionar fecha",
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-slate-700 font-bold mb-2">{label}</Text>

      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="bg-slate-50 border border-slate-300 rounded-lg h-12 px-4 flex-row items-center justify-between"
      >
        <Text
          className={`text-base ${value ? "text-slate-900" : "text-slate-400"}`}
        >
          {value ? new Date(value).toLocaleDateString() : placeholder}
        </Text>
        <CalendarIcon size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={isVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View className="flex-1 bg-black/50 items-center justify-center p-4">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl p-4 w-full shadow-xl">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-slate-800">
                    Seleccionar Fecha
                  </Text>
                  <TouchableOpacity onPress={() => setIsVisible(false)}>
                    <X size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <Calendar
                  current={value}
                  onDayPress={(day) => {
                    onDateSelect(day.dateString);
                    setIsVisible(false);
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  theme={{
                    selectedDayBackgroundColor: "#2563EB",
                    todayTextColor: "#2563EB",
                    arrowColor: "#2563EB",
                  }}
                  markedDates={{
                    [value]: { selected: true, disableTouchEvent: true },
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
