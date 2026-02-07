import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Home, Calendar, Handshake, Target, Bell } from 'lucide-react-native';
import { GroupDetailScreen } from '../modules/group/screens/GroupDetailScreen';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ title }: { title: string }) => (
    <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-gray-500 text-center">Próximamente disponible</Text>
    </View>
);

const ActivitiesScreen = () => <PlaceholderScreen title="Actividades" />;
const CommitmentsScreen = () => <PlaceholderScreen title="Compromisos" />;
const GoalsScreen = () => <PlaceholderScreen title="Meta" />;
const NoticesScreen = () => <PlaceholderScreen title="Avisos" />;

export function GroupTabNavigator() {
    const route = useRoute<any>();
    const { groupId } = route.params || {};
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="TabHome"
                component={GroupDetailScreen}
                initialParams={{ groupId }}
                options={{
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <Home size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TabActivities"
                component={ActivitiesScreen}
                initialParams={{ groupId }}
                options={{
                    tabBarLabel: 'Actividades',
                    tabBarIcon: ({ color, size }) => (
                        <Calendar size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TabCommitments"
                component={CommitmentsScreen}
                initialParams={{ groupId }}
                options={{
                    tabBarLabel: 'Compromisos',
                    tabBarIcon: ({ color, size }) => (
                        <Handshake size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TabGoals"
                component={GoalsScreen}
                initialParams={{ groupId }}
                options={{
                    tabBarLabel: 'Meta',
                    tabBarIcon: ({ color, size }) => (
                        <Target size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TabNotices"
                component={NoticesScreen}
                initialParams={{ groupId }}
                options={{
                    tabBarLabel: 'Avisos',
                    tabBarIcon: ({ color, size }) => (
                        <Bell size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
