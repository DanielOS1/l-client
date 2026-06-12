import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { useActivityStore } from "../../../store/useActivityStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { assignmentService } from "../../activity/services/assignment.service";
import { Activity, Assignment } from "../../../types/operations.types";
import { MapPin, Calendar as CalendarIcon, Plus } from "lucide-react-native";
import { Button } from "../../../components/Button";
import { useGroupStore } from "../../../store/useGroupStore";
import { ROLE_LEVELS } from "../../../constants/role-levels";

interface SemesterAgendaProps {
  semesterId: string;
  startDate: string;
  endDate: string;
}

// Converts a date-only "YYYY-MM-DD" string to a local-noon Date to avoid UTC offset issues
const parseDate = (dateStr: string): Date =>
  new Date(dateStr.includes("T") ? dateStr : dateStr + "T12:00:00");

export function SemesterAgenda({
  semesterId,
  startDate,
  endDate,
}: SemesterAgendaProps) {
  const navigation = useNavigation<any>();
  const { activities, fetchSemesterActivities, setActiveActivity } =
    useActivityStore();
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();

  const [selectedDate, setSelectedDate] = useState(startDate);
  const [userAssignmentActivityIds, setUserAssignmentActivityIds] = useState<
    Set<string>
  >(new Set());

  const currentUserGroup = activeGroup?.userGroups?.find(
    (ug) => ug.user.id === user?.id
  );
  const myLevel = currentUserGroup?.groupRole?.level || 0;
  const canManage = myLevel >= ROLE_LEVELS.ADMIN;

  useEffect(() => {
    fetchSemesterActivities(semesterId);
    setSelectedDate(startDate);
  }, [semesterId, startDate]);

  useEffect(() => {
    if (!user?.id) return;
    assignmentService.getByUser(user.id).then((all: Assignment[]) => {
      const ids = new Set(
        all
          .filter((a) => a.activity?.id)
          .map((a) => a.activity!.id)
      );
      setUserAssignmentActivityIds(ids);
    }).catch(() => {});
  }, [user?.id, semesterId]);

  const dayActivities = useMemo(() => {
    if (!activities) return [];
    return activities.filter((a) => a.date.startsWith(selectedDate));
  }, [activities, selectedDate]);

  const markedDates = useMemo(() => {
    const marks: any = {};

    activities.forEach((activity) => {
      const dateStr = activity.date.split("T")[0];
      const hasMyAssignment = userAssignmentActivityIds.has(activity.id);
      marks[dateStr] = {
        marked: true,
        dotColor: "transparent",
        customStyles: {
          container: {
            backgroundColor: hasMyAssignment ? "#FFF3CC" : "#d0f5f3",
            borderRadius: 8,
          },
          text: {
            color: hasMyAssignment ? "#B45309" : "#0e7490",
            fontWeight: "bold",
          },
        },
      };
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#3AC4BE",
      selectedTextColor: "#ffffff",
      customStyles: {
        container: { backgroundColor: "#3AC4BE", borderRadius: 50 },
        text: { color: "white", fontWeight: "bold" },
      },
    };

    return marks;
  }, [activities, selectedDate, userAssignmentActivityIds]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const hasMyAssignment = userAssignmentActivityIds.has(item.id);
    return (
      <TouchableOpacity
        className={`bg-white p-4 rounded-xl mb-3 shadow-sm border-l-4 ${
          hasMyAssignment ? "border-l-brand-gold" : "border-l-brand-teal"
        }`}
        onPress={() => {
          setActiveActivity(item);
          navigation.navigate("ActivityDetail", {
            activityId: item.id,
            semesterId,
          });
        }}
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-base font-bold text-slate-800 mb-1 flex-1">
            {item.name}
          </Text>
          {hasMyAssignment && (
            <View className="bg-amber-100 px-2 py-0.5 rounded-full ml-2">
              <Text className="text-amber-700 text-xs font-bold">Asignado</Text>
            </View>
          )}
        </View>
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
        </View>
      </TouchableOpacity>
    );
  };

  const timelineData = useMemo(() => {
    if (!activities) return [];
    return [...activities].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [activities]);

  const renderTimelineItem = ({
    item,
    index,
  }: {
    item: Activity;
    index: number;
  }) => {
    const date = parseDate(item.date);
    const isLast = index === timelineData.length - 1;
    const hasMyAssignment = userAssignmentActivityIds.has(item.id);

    return (
      <View className="flex-row w-[280px] mr-4 relative">
        <View className="items-center mr-3">
          <View
            className="w-3 h-3 rounded-full z-10"
            style={{
              backgroundColor: hasMyAssignment ? "#FFC200" : "#3AC4BE",
            }}
          />
          {!isLast && (
            <View
              style={{
                position: "absolute",
                top: 12,
                height: "100%",
                left: 5,
                width: 2,
                backgroundColor: "#e2e8f0",
              }}
            />
          )}
        </View>
        <TouchableOpacity
          className="flex-1 bg-white p-3 rounded-xl border border-slate-100 mb-2 shadow-sm"
          onPress={() =>
            navigation.navigate("ActivityDetail", {
              activityId: item.id,
              semesterId,
            })
          }
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-brand-teal font-bold text-xs">
              {date.toLocaleDateString("es-CL", {
                day: "numeric",
                month: "short",
              })}
            </Text>
            {hasMyAssignment && (
              <View className="bg-amber-100 px-1.5 py-0.5 rounded-full">
                <Text className="text-amber-700 text-xs font-bold">Tú</Text>
              </View>
            )}
          </View>
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
          current={selectedDate}
          minDate={startDate}
          maxDate={endDate}
          onDayPress={handleDayPress}
          markingType={"custom"}
          markedDates={markedDates}
          theme={{
            todayTextColor: "#3AC4BE",
            arrowColor: "#3AC4BE",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "500",
          }}
        />
      </View>

      {/* Legend */}
      <View className="mx-4 mb-2 flex-row gap-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#d0f5f3] mr-1" />
          <Text className="text-xs text-slate-500">Actividad</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded bg-[#FFF3CC] mr-1" />
          <Text className="text-xs text-slate-500">Asignado</Text>
        </View>
      </View>

      <View className="flex-1 px-4">
        <View className="mb-6">
          <Text className="text-sm font-bold text-slate-700 mb-2">
            Línea de Tiempo
          </Text>
          <FlatList
            horizontal
            data={timelineData}
            renderItem={renderTimelineItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          />
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-slate-800">
            {parseDate(selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
          {canManage && (
            <Button
              title="Nueva"
              onPress={() =>
                navigation.navigate("CreateActivity", { semesterId })
              }
              variant="ghost"
              className="h-8 px-2"
              icon={<Plus size={16} color="#3AC4BE" />}
            />
          )}
        </View>

        {dayActivities.length === 0 ? (
          <View className="items-center justify-center py-6 bg-white rounded-xl border border-dashed border-slate-300">
            <CalendarIcon size={32} color="#cbd5e1" />
            <Text className="text-slate-400 italic mt-2">
              No hay actividades este día
            </Text>
          </View>
        ) : (
          <FlatList
            data={dayActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
}
