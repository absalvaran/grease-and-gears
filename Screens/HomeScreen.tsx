import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Container from '../Components/Container';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const cards = ['Timer', 'Race', 'Inventory', 'Leaderboards'];

  return (
    <Container>
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Text style={styles.heading}>Welcome Back, Racer!</Text>
        <Text style={styles.subheading}>
          Ready to dominate the track today?
        </Text>
      </View>
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#1fb555', borderWidth: 0 }]}
          onPress={() => navigation.navigate('Timer')}
        >
          <Text style={[styles.cardText, { color: 'white' }]}>Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: '#06cceeff', borderWidth: 0 },
          ]}
          disabled={false}
          onPress={() => navigation.navigate('Race')}
        >
          <Text style={[styles.cardText, { color: 'white' }]}>Race</Text>
          {/* <View
            style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }}
          >
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View> */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} disabled>
          <Text style={styles.cardText}>Motor Checker</Text>
          <View
            style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }}
          >
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} disabled>
          <Text style={styles.cardText}>Inventory</Text>
          <View
            style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }}
          >
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} disabled>
          <Text style={styles.cardText}>Builds</Text>
          <View
            style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }}
          >
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} disabled>
          <Text style={styles.cardText}>Leaderboards</Text>
          <View
            style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }}
          >
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#f1f6fe',
  },
  logo: {
    height: 300,
    borderColor: 'red',
    borderWidth: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 24,
    opacity: 0.75,
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    gap: '2%',
  },
  card: {
    borderColor: 'black',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  cardText: {
    fontSize: 20,
    fontWeight: 700,
  },
  comingSoon: {
    fontSize: 16,
    color: 'gray',
  },
});
