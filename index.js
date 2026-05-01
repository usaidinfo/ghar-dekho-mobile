/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {getApp} from '@react-native-firebase/app';
// Must import from package root (not `.../lib/modular`) so native module registers via createModuleNamespace.
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';

setBackgroundMessageHandler(getMessaging(getApp()), async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});


AppRegistry.registerComponent(appName, () => App);
