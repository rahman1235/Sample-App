import React from 'react';
import { StyleSheet, Text, View, Component,ActivityIndicator, StatusBar, } from 'react-native';
import { createStackNavigator, createAppContainer,  createSwitchNavigator } from 'react-navigation'; 
import LoginScreen from './src/components/home';
import ScannerScreen from './src/components/details';
import {
  createBottomTabNavigator,
  NavigationActions,
  SafeAreaView,
} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
const USER_KEY = 'ACCESS_TOKEN';

const RootStack = createStackNavigator(
  {
    Scanner: ScannerScreen
  },
  {
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#002E6E',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
);

const AuthStack = createStackNavigator({
    Login: LoginScreen,
  },
  {
  defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#002E6E',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
);

class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.__loadData();
  }

  render() {
    return(
      <View style = {styles.authscreencontainer}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }

  __loadData = async() => {
    const access_token = await AsyncStorage.getItem(USER_KEY);
    if (access_token && access_token.length > 0) {
      this.props.navigation.navigate('App');
    } else {
      this.props.navigation.navigate('Auth');
    }
  }
}

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: RootStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    }
  )
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authscreencontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
