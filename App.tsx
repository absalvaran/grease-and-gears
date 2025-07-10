import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import TimerScreen from './Screens/TimerScreen';
import RaceScreen from './Screens/RaceScreen';
import HomeScreen from './Screens/HomeScreen';
import InventoryScreen from './Screens/InventoryScreen';
import BuildsScreen from './Screens/BuildsScreen';
import ComingSoonScreen from './Screens/ComingSoonScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Timer"
          component={TimerScreen}
          options={{ headerShown: false }}
        />
        {/* <Tab.Screen name="Race" component={ComingSoonScreen} />
        <Tab.Screen name="Inventory" component={ComingSoonScreen} />
        <Tab.Screen name="Builds" component={ComingSoonScreen} />
        <Tab.Screen name="Leaderboards" component={ComingSoonScreen} />
      </Tab.Navigator> */}
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Timer"
          component={TimerScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
