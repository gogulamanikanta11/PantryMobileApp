import * as Notifications
from 'expo-notifications';

import {
Platform
} from 'react-native';

export async function sendNotification(){

if(
Platform.OS === 'web'
){

return;

}

await Notifications.scheduleNotificationAsync({

content:{

title:'Smart Pantry AI',

body:'Your pantry item is expiring soon!'

},

trigger:{
seconds:5
}

});

}