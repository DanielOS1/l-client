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

  // Derived state: Marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {};

    // Mark dates with activities
    activities.forEach((activity) => {
      const dateStr = activity.date.split("T")[0];
      // Use a custom style for the day holding an activity
      marks[dateStr] = {
        marked: true,
        dotColor: "transparent", // Hide default dot
        customStyles: {
          container: {
            backgroundColor: "#dbeafe", // Light blue background
            borderRadius: 8,
          },
          text: {
            color: "#1e40af", // Dark blue text
            fontWeight: "bold",
          },
        },
      };
    });

    // Highlight selected date overrides
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#2563EB",
      selectedTextColor: "#ffffff",
      customStyles: { // Reset custom style for selected to standard blue circle
        container: {
          backgroundColor: "#2563EB",
          borderRadius: 50
        },
        text: {
          color: "white",
          fontWeight: "bold"
        }
      }
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
      <View className="flex-row items-center mt-2">
        {item.activityPositions && (
          <Text className="text-slate-400 text-xs mr-3">
            Posiciones: {item.activityPositions.length}
          </Text>
        )}
        <Text className="text-slate-400 text-xs">
          {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Group activities by month for the timeline
  const timelineData = useMemo(() => {
    if (!activities) return [];
    const sorted = [...activities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted;
  }, [activities]);

  const renderTimelineItem = ({ item, index }: { item: Activity, index: number }) => {
    const date = new Date(item.date);
    const isLast = index === timelineData.length - 1;

    return (
      <View className="flex-row w-[280px] mr-4 relative">
        <View className="items-center mr-3">
          <View className="w-3 h-3 rounded-full bg-blue-500 z-10" />
          {!isLast && <View className="w-0.5 flex-1 bg-slate-200 -my-1" style={{ position: 'absolute', top: 12, height: '100%', left: 5, width: 2 }} />}
          {/* Horizontal line connector if needed for row layout, but here we are doing horizontal scroll cards */}
        </View>
        <TouchableOpacity
          className="flex-1 bg-white p-3 rounded-xl border border-slate-100 mb-2 shadow-sm"
          onPress={() => navigation.navigate("ActivityDetail", { activityId: item.id })}
        >
          <Text className="text-blue-600 font-bold text-xs mb-1">
            {date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text className="font-bold text-slate-800 mb-0.5">{item.name}</Text>
          <Text className="text-slate-500 text-xs">{item.location}</Text>
        </TouchableOpacity>

        {!isLast && (
          <View className="absolute top-1/2 -right-4 w-4 h-[2px] bg-slate-200" />
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white rounded-xl shadow-sm mb-4 mx-4 mt-2 overflow-hidden">
        <Calendar
          current={selectedDate} // Initially focus on selected
          minDate={startDate}
          maxDate={endDate}
          onDayPress={handleDayPress}
          markingType={'custom'}
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
        {/* Timeline Horizontal Scroll */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-slate-700 mb-2">Línea de Tiempo</Text>
          <FlatList
            horizontal
            data={timelineData}
            renderItem={renderTimelineItem}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        <View className="flex-row justify-between items-center mb-3">
          {/* Header for Day View */}
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
          <View className="items-center justify-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
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
