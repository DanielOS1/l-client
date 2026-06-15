import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { Home, Calendar, Handshake, Target, Bell } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Home tab screens
import { GroupDetailScreen } from '../modules/group/screens/GroupDetailScreen';
import { GroupRolesListScreen } from '../modules/group/screens/GroupRolesListScreen';
import { CreateGroupRoleScreen } from '../modules/group/screens/CreateGroupRoleScreen';
import { AddMemberScreen } from '../modules/group/screens/AddMemberScreen';

// Activities tab screens
import { SemestersListScreen } from '../modules/semester/screens/SemestersListScreen';
import { CreateSemesterScreen } from '../modules/semester/screens/CreateSemesterScreen';
import { SemesterDetailScreen } from '../modules/semester/screens/SemesterDetailScreen';
import { CreateActivityScreen } from '../modules/activity/screens/CreateActivityScreen';
import { ActivityDetailScreen } from '../modules/activity/screens/ActivityDetailScreen';
import { EditActivityScreen } from '../modules/activity/screens/EditActivityScreen';
import { ManagePositionsScreen } from '../modules/semester/screens/ManagePositionsScreen';

// Other tabs
import { CommitmentsScreen } from '../modules/semester/screens/CommitmentsScreen';
import { AvisosScreen } from '../modules/notices/screens/AvisosScreen';
import { CreateNoticeScreen } from '../modules/notices/screens/CreateNoticeScreen';
import { NoticeDetailScreen } from '../modules/notices/screens/NoticeDetailScreen';
import { useNoticeStore } from '../store/useNoticeStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ActivitiesStack = createNativeStackNavigator();
const NoticesStack = createNativeStackNavigator();

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View className="flex-1 items-center justify-center bg-white p-4">
    <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
    <Text className="text-gray-500 text-center">Próximamente disponible</Text>
  </View>
);

const GoalsScreen = () => <PlaceholderScreen title="Meta" />;

function NoticesStackNavigator() {
  return (
    <NoticesStack.Navigator screenOptions={{ headerShown: false }}>
      <NoticesStack.Screen name="Avisos" component={AvisosScreen} />
      <NoticesStack.Screen name="CreateNotice" component={CreateNoticeScreen} />
      <NoticesStack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
    </NoticesStack.Navigator>
  );
}

// Nested stack for the Inicio tab — keeps tab bar visible through all admin flows
function HomeStackNavigator() {
  const route = useRoute<any>();
  const { groupId } = route.params || {};

  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        initialParams={{ groupId }}
      />
      <HomeStack.Screen name="GroupRolesList" component={GroupRolesListScreen} />
      <HomeStack.Screen name="CreateGroupRole" component={CreateGroupRoleScreen} />
      <HomeStack.Screen name="AddMember" component={AddMemberScreen} />
    </HomeStack.Navigator>
  );
}

// Nested stack for the Actividades tab — keeps tab bar visible while browsing semesters and activities
function ActivitiesStackNavigator() {
  const route = useRoute<any>();
  const { groupId } = route.params || {};

  return (
    <ActivitiesStack.Navigator screenOptions={{ headerShown: false }}>
      <ActivitiesStack.Screen
        name="SemestersList"
        component={SemestersListScreen}
        initialParams={{ groupId }}
      />
      <ActivitiesStack.Screen name="CreateSemester" component={CreateSemesterScreen} />
      <ActivitiesStack.Screen name="SemesterDetail" component={SemesterDetailScreen} />
      <ActivitiesStack.Screen name="CreateActivity" component={CreateActivityScreen} />
      <ActivitiesStack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <ActivitiesStack.Screen name="EditActivity" component={EditActivityScreen} />
      <ActivitiesStack.Screen name="ManagePositions" component={ManagePositionsScreen} />
    </ActivitiesStack.Navigator>
  );
}

export function GroupTabNavigator() {
  const route = useRoute<any>();
  const { groupId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { unreadCount, checkForNewNotices } = useNoticeStore();
  const { checkForNewAssignments } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!groupId) return;
    checkForNewNotices(groupId);
    if (user?.id) checkForNewAssignments(user.id);
  }, [groupId]);

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
        tabBarActiveTintColor: '#3AC4BE',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarBadgeStyle: {
          backgroundColor: '#ef4444',
          fontSize: 10,
          minWidth: 16,
          height: 16,
          lineHeight: 16,
        },
      }}
    >
      <Tab.Screen
        name="TabHome"
        component={HomeStackNavigator}
        initialParams={{ groupId }}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="TabActivities"
        component={ActivitiesStackNavigator}
        initialParams={{ groupId }}
        options={{
          tabBarLabel: 'Actividades',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="TabCommitments"
        component={CommitmentsScreen}
        options={{
          tabBarLabel: 'Compromisos',
          tabBarIcon: ({ color }) => <Handshake size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="TabGoals"
        component={GoalsScreen}
        options={{
          tabBarLabel: 'Meta',
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="TabNotices"
        component={NoticesStackNavigator}
        options={{
          tabBarLabel: 'Avisos',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}
