import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { LoginScreen } from "../modules/auth/screens/LoginScreen";
import { RegisterScreen } from "../modules/auth/screens/RegisterScreen";
import { Button } from "../components/Button";

import { GroupsListScreen } from "../modules/group/screens/GroupsListScreen";
import { CreateGroupScreen } from "../modules/group/screens/CreateGroupScreen";
import { GroupDetailScreen } from "../modules/group/screens/GroupDetailScreen";
import { CreateGroupRoleScreen } from "../modules/group/screens/CreateGroupRoleScreen";
import { AddMemberScreen } from "../modules/group/screens/AddMemberScreen";
import { SemestersListScreen } from "../modules/semester/screens/SemestersListScreen";
import { CreateSemesterScreen } from "../modules/semester/screens/CreateSemesterScreen";
import { SemesterDetailScreen } from "../modules/semester/screens/SemesterDetailScreen";
import { CreateActivityScreen } from "../modules/activity/screens/CreateActivityScreen";
import { ActivityDetailScreen } from "../modules/activity/screens/ActivityDetailScreen";

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="GroupsList" component={GroupsListScreen} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
            <Stack.Screen
              name="CreateGroupRole"
              component={CreateGroupRoleScreen}
            />
            <Stack.Screen name="AddMember" component={AddMemberScreen} />

            <Stack.Screen
              name="SemestersList"
              component={SemestersListScreen}
            />
            <Stack.Screen
              name="CreateSemester"
              component={CreateSemesterScreen}
            />
            <Stack.Screen
              name="SemesterDetail"
              component={SemesterDetailScreen}
            />
            <Stack.Screen
              name="CreateActivity"
              component={CreateActivityScreen}
            />
            <Stack.Screen
              name="ActivityDetail"
              component={ActivityDetailScreen}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
