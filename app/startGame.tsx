import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';

const buttonImage = require('@/assets/images/redButton.png');

export default function startGame() {

    const router = useRouter();
    const navigateToQuestionPage = () => {router.push('/questionPage')};

    return (
        <BackgroundWrapper>
            <View style={styles.container}>
                <Text>Dette er startskjermen</Text>
                <Button imageSource={buttonImage} imageStyle={styles.imageStyle} onPress={navigateToQuestionPage} />
            </View>
        </BackgroundWrapper>
    )
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