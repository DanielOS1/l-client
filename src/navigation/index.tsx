import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { LoginScreen } from "../modules/auth/screens/LoginScreen";
import { RegisterScreen } from "../modules/auth/screens/RegisterScreen";

import { GroupsListScreen } from "../modules/group/screens/GroupsListScreen";
import { GroupTabNavigator } from "./GroupTabNavigator";
import { CreateGroupScreen } from "../modules/group/screens/CreateGroupScreen";
import { UserProfileScreen } from "../modules/auth/screens/UserProfileScreen";

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
        <ActivityIndicator size="large" color="#3AC4BE" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="GroupsList" component={GroupsListScreen} />
            <Stack.Screen name="GroupTabs" component={GroupTabNavigator} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
