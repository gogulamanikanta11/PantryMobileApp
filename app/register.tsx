import React from 'react';

import { useState } from 'react';

import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert
} from 'react-native';

import {
createUserWithEmailAndPassword
} from 'firebase/auth';

import { auth } from '../firebase/config';

import { router } from 'expo-router';

export default function RegisterScreen(){

const [email,setEmail]=useState('');

const [password,setPassword]=useState('');

const register=async()=>{

if(!email || !password){

Alert.alert(
'Error',
'Enter email and password'
);

return;

}

try{

await createUserWithEmailAndPassword(
auth,
email,
password
);

Alert.alert(
'Success',
'Account Created'
);

router.replace(
'/login'
);

}

catch(error:any){

Alert.alert(
'Register Error',
error.message
);

}

};

return(

<View style={styles.container}>

<Text style={styles.title}>
Create Account
</Text>

<TextInput
placeholder="Email"
style={styles.input}
value={email}
onChangeText={setEmail}
/>

<TextInput
placeholder="Password"
secureTextEntry
style={styles.input}
value={password}
onChangeText={setPassword}
/>

<TouchableOpacity
style={styles.button}
onPress={register}
>

<Text style={styles.buttonText}>
Register
</Text>

</TouchableOpacity>

</View>

);

}

const styles=StyleSheet.create({

container:{
flex:1,
justifyContent:'center',
padding:20,
backgroundColor:'#fff'
},

title:{
fontSize:30,
fontWeight:'bold',
marginBottom:30,
textAlign:'center',
color:'green'
},

input:{
borderWidth:1,
padding:15,
borderRadius:10,
marginBottom:15
},

button:{
backgroundColor:'green',
padding:15,
borderRadius:10
},

buttonText:{
color:'white',
textAlign:'center',
fontWeight:'bold'
}

});