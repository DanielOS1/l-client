import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { Activity } from "../../../types/operations.types";
import { MapPin, Calendar as CalendarIcon, Plus } from "lucide-react-native";
import { Button } from "../../../components/Button";

// Configuration is already global in DatePicker or we can re-ensure it here if needed
// LocaleConfig setup... (assumed global or we can duplicate to be safe)

interface SemesterAgendaProps {
  semesterId: string;
  startDate: string;
  endDate: string;
}

export function SemesterAgenda({
  semesterId,
  startDate,
  endDate,
}: SemesterAgendaProps) {
  const navigation = useNavigation<any>();
  const { activities, fetchSemesterActivities, setActiveActivity } =
    useActivityStore();

  // State for the currently selected date in the view
  const [selectedDate, setSelectedDate] = useState(startDate);

  useEffect(() => {
    fetchSemesterActivities(semesterId);
    // Reset selection to start date when semester changes
    setSelectedDate(startDate);
  }, [semesterId, startDate]);

  // Derived state: Activities for the selected date
  const dayActivities = useMemo(() => {
    if (!activities) return [];
    return activities.filter((a) => a.date.startsWith(selectedDate));
  }, [activities, selectedDate]);

  // Derived state: Marked dates for the calendar (dots)
  const markedDates = useMemo(() => {
    const marks: any = {};

    // Mark dates with activities
    activities.forEach((activity) => {
      const dateStr = activity.date.split("T")[0];
      marks[dateStr] = { marked: true, dotColor: "#2563EB" };
    });

    // Highlight selected date
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}), // keep dot if exists
      selected: true,
      selectedColor: "#2563EB",
      selectedTextColor: "#ffffff",
    };

    return marks;
  }, [activities, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border-l-4 border-l-blue-600"
      onPress={() => {
        setActiveActivity(item);
        navigation.navigate("ActivityDetail", { activityId: item.id });
      }}
    >
      <Text className="text-base font-bold text-slate-800 mb-1">
        {item.name}
      </Text>
      <View className="flex-row items-center">
        <MapPin size={14} color="#64748b" />
        <Text className="text-slate-500 text-xs ml-1">{item.location}</Text>
      </View>
      {item.description && (
        <Text className="text-slate-400 text-xs mt-2" numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white rounded-xl shadow-sm mb-4 mx-4 mt-2 overflow-hidden">
        <Calendar
          current={selectedDate} // Initially focus on selected
          minDate={startDate}
          maxDate={endDate}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            todayTextColor: "#2563EB",
            arrowColor: "#2563EB",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
          }}
        />
      </View>

      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-slate-800">
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
          <Button
            title="Nueva"
            onPress={() =>
              navigation.navigate("CreateActivity", { semesterId })
            }
            variant="ghost"
            className="h-8 px-2"
            icon={<Plus size={16} color="#2563EB" />}
          />
        </View>

        {dayActivities.length === 0 ? (
          <View className="items-center justify-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
            <CalendarIcon size={32} color="#cbd5e1" className="mb-2" />
            <Text className="text-slate-400 italic">
              No hay actividades este día
            </Text>
          </View>
        ) : (
          <FlatList
            data={dayActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            scrollEnabled={false} // Nested in ScrollView usually, or careful handling
          />
        )}
      </View>
    </View>
  );
}
