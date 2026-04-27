import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { T } from "@/constants/tokens";

export default function AddTab() {
  useFocusEffect(
    useCallback(() => {
      router.replace("/input");
    }, [])
  );

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
});
