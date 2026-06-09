import React from 'react';
import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
} from 'react-native';

export default function SignupScreen() {

return (

<View style={styles.container}>

<Text style={styles.title}>
Create Account
</Text>

<TextInput
placeholder="Full Name"
style={styles.input}
/>

<TextInput
placeholder="Email"
style={styles.input}
/>

<TextInput
placeholder="Password"
secureTextEntry
style={styles.input}
/>

<TouchableOpacity style={styles.button}>
<Text style={styles.buttonText}>
Sign Up
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
fontSize:32,
fontWeight:'bold',
textAlign:'center',
marginBottom:40,
color:'green'
},

input:{
borderWidth:1,
padding:15,
marginBottom:15,
borderRadius:10
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