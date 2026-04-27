import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { T } from "@/constants/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.tertiary,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor:
            Platform.OS === "ios" ? "transparent" : T.surface,
          borderTopWidth: 1,
          borderTopColor: T.border,
          elevation: 0,
          height: Platform.OS === "web" ? 84 : 80,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: T.surface }]}
            />
          ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
          marginBottom: Platform.OS === "web" ? 0 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: T.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="plus" size={24} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
          tabBarItemStyle: {
            paddingTop: 4,
          },
          tabBarActiveTintColor: T.primary,
          tabBarInactiveTintColor: T.secondary,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/input");
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
