import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import BackgroundWrapper from '@/components/BackgroundWrapper';

SplashScreen.preventAutoHideAsync(); //  ikke skjul splashscreen automatisk

export default function RootLayout() {
  console.log('RootLayout render');
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

  return (
    <BackgroundWrapper>
      <Stack>
    
      <Stack.Screen name="index" options={{
        headerShown: false,
        animation: 'none',
        }} />
      
      <Stack.Screen name="startGame" options={{
        title: '',
        headerTransparent: true,
        animation: 'fade',
        }} />
      
      <Stack.Screen name="joinGame" options={{
        title: '',
        headerTransparent: true,
        animation: 'fade',
      }} />

      <Stack.Screen name="challengeScreen" options={{
        title: '',
        headerTransparent: true,
        animation: 'fade',
        }} />
      
      <Stack.Screen name="startGameSetup" options={{
        title: '',
        headerTransparent: true,
        animation: 'fade',
        }} />
      
    </Stack>
  </BackgroundWrapper> 
  );
}
