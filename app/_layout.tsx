import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {

  useEffect(() => {
      Asset.loadAsync([require('@/assets/images/background.png')]);
    }, []);

  return <Stack>
    <Stack.Screen name="index" options={{
      headerShown: false,
      animation: 'none',
      presentation: 'card'
      }} />
    
    <Stack.Screen name="startGame" options={{
      title: '',
      headerTransparent: true,
      animation: 'fade',
      presentation: 'card',
      }} />
    
    <Stack.Screen name="joinGame" options={{
      title: '',
      headerTransparent: true,
      animation: 'fade',
      presentation: 'card',
    }} />

    <Stack.Screen name="questionPage" options={{
      title: '',
      headerTransparent: true,
      animation: 'fade',
      presentation: 'card',
    }} />

    <Stack.Screen name="chooseWinner" options={{
      title: '',
      headerTransparent: true,
      animation: 'fade',
      presentation: 'card',
    }} />

    <Stack.Screen name="resultPage" options={{
      title: '',
      headerTransparent: true,
      animation: 'fade',
      presentation: 'card',
    }} />

  </Stack>
}
