import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TimerScreen from './Screens/TimerScreen';
import RaceScreen from './Screens/RaceScreen';
import HomeScreen from './Screens/HomeScreen';
// import InventoryScreen from './src/screens/InventoryScreen';
// import BuildsScreen from './src/screens/BuildsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Timer" component={TimerScreen} />
        <Tab.Screen name="Race" component={RaceScreen} />
        {/* <Tab.Screen name="Inventory" component={InventoryScreen} /> */}
        {/* <Tab.Screen name="Builds" component={BuildsScreen} /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}