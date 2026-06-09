import React from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
View,
Text,
StyleSheet,
TouchableOpacity
} from 'react-native';

export default function ProfileScreen(){

return(

<View style={styles.container}>

<Text style={styles.title}>
Profile
</Text>

<Text style={styles.info}>
User: Demo User
</Text>

<Text style={styles.info}>
Email: demo@gmail.com
</Text>

<TouchableOpacity
style={styles.button}
onPress={async () => {

await AsyncStorage.removeItem(
'user'
);

router.replace(
'/login'
);

}}
>

<Text style={styles.buttonText}>
Logout
</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/settings')}
>

<Text style={styles.buttonText}>
Settings
</Text>

</TouchableOpacity>

</View>

);

}

const styles=
StyleSheet.create({

container:{
flex:1,
justifyContent:'center',
padding:20
},

title:{
fontSize:30,
fontWeight:'bold',
marginBottom:30,
color:'green'
},

info:{
fontSize:18,
marginBottom:15
},

button:{
backgroundColor:'green',
padding:15,
borderRadius:10,
marginTop:10
},

buttonText:{
color:'white',
textAlign:'center'
}

});