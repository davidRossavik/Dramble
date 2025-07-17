import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync(); //  ikke skjul splashscreen automatisk

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false); //  holder styr på om vi er klare

  useEffect(() => {
    async function prepare() {
      try {
        //  last inn bildene du bruker med en gang
        await Asset.loadAsync([
          require('@/assets/images/background.png'),
          require('@/assets/images/textLogo.png'),
          require('@/assets/images/redButton.png'),
        ]);
      } catch (e) {
        console.warn("Feil ved lasting av bilder", e);
      } finally {
        setIsReady(true);           // ✅ vi er klare!
        await SplashScreen.hideAsync(); // ✅ skjul splashscreen og vis app
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null; // ⏳ vis ingenting før vi er klare
  }

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


    <Stack.Screen name="OneVsOne" options={{
      title: '',
      headerTransparent: true,
      animation: 'fade',
      presentation: 'card',
    }} />

    {/* Disse har vi ikke med per nå */}
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
