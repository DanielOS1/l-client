import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "react-native-paper";
import { Calendar, MapPin, ArrowRight } from "lucide-react-native";
import { activityService } from "../../activity/services/activity.service";
import { useSemesterStore } from "../../../store/useSemesterStore";

interface Activity {
    id: string;
    name: string;
    date: string;
    location: string;
    activityPositions?: any[];
    assignments?: any[];
}

export function UpcomingActivities({ groupId }: { groupId: string }) {
    const navigation = useNavigation<any>();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const { activeSemester } = useSemesterStore();

    useEffect(() => {
        // If we have an active semester, we could filter by it, 
        // but for "Upcoming" we might want the nearest ones regardless of semester if possible,
        // or just the ones from the current semester.
        // For now, let's assume we fetch from the active semester if available.
        if (activeSemester?.id) {
            fetchActivities(activeSemester.id);
        }
    }, [activeSemester]);

    const fetchActivities = async (semesterId: string) => {
        setLoading(true);
        try {
            const data = await activityService.getBySemesterId(semesterId);
            // Filter future activities and sort by date
            const now = new Date();
            const upcoming = data
                .filter((a: any) => new Date(a.date) >= now)
                .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5); // Take top 5
            setActivities(upcoming);
        } catch (error) {
            console.log("Error fetching activities", error);
        } finally {
            setLoading(false);
        }
    };

    if (activities.length === 0 && !loading) return null;

    return (
        <View className="mt-6 px-2">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-slate-800">Próximas Actividades</Text>
                <TouchableOpacity onPress={() => {
                    if (activeSemester?.id) {
                        navigation.navigate("SemesterDetail", { semesterId: activeSemester.id });
                    }
                }}>
                    <Text className="text-blue-600 font-medium text-sm">Ver todas</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
                {activities.map((activity) => {
                    const date = new Date(activity.date);
                    const day = date.getDate();
                    const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();

                    // Calculate progress if available (placeholder logic until backend is ready)
                    const totalPositions = activity.activityPositions?.reduce((acc: number, curr: any) => acc + curr.quantity, 0) || 0;
                    const filledPositions = activity.assignments?.length || 0;
                    const progress = totalPositions > 0 ? filledPositions / totalPositions : 0;

                    return (
                        <Card
                            key={activity.id}
                            style={{ backgroundColor: "white", borderRadius: 16, marginRight: 12, width: 280 }}
                            mode="elevated"
                            onPress={() => navigation.navigate("ActivityDetail", { activityId: activity.id })}
                        >
                            <Card.Content className="p-4">
                                <View className="flex-row gap-4">
                                    <View className="bg-blue-50 rounded-xl items-center justify-center w-16 h-16">
                                        <Text className="text-blue-600 font-bold text-xl">{day}</Text>
                                        <Text className="text-blue-400 text-xs font-bold">{month}</Text>
                                    </View>
                                    <View className="flex-1 justify-center">
                                        <Text className="text-slate-800 font-bold text-base numberOfLines={1}">{activity.name}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <Text className="text-slate-500 text-xs">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {activity.location}</Text>
                                        </View>
                                    </View>
                                    <View className="justify-center">
                                        <ArrowRight size={20} color="#cbd5e1" />
                                    </View>
                                </View>

                                {/* Progress Bar */}
                                <View className="mt-4">
                                    <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <View
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${Math.min(progress * 100, 100)}%` }}
                                        />
                                    </View>
                                    <Text className="text-right text-xs text-slate-400 mt-1">
                                        {filledPositions}/{totalPositions || "?"}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                })}
            </ScrollView>
        </View>
    );
}
