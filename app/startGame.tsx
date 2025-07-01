import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';

const buttonImage = require('@/assets/images/redButton.png');

export default function StartGame() {
  const router = useRouter();

  // ✅ Henter parametere fra URL-en
  const { code } = useLocalSearchParams();

  const navigateToQuestionPage = () => {
    router.push('/questionPage');
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text>spillkoden er: {code}</Text>
        
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageStyle: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
    }
});