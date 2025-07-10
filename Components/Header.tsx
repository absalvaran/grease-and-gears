import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, StyleSheet, Image, Pressable } from 'react-native';

export default function Header() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          navigation.popTo('Home');
        }}
      >
        <Image
          source={require('../assets/images/logo.png')}
          resizeMode="contain"
          style={styles.logo}
        />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',
    height: 100,
    borderBottomWidth: 2,
    borderBottomColor: '#004cb3',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  logo: {
    height: 100,
    width: 100,
    alignSelf: 'flex-start',
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
  },
  subheading: {
    fontSize: 18,
    opacity: 0.75,
  },
});
