import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert
} from 'react-native';

import {
collection,
addDoc
} from 'firebase/firestore';

import { db } from '../firebase/config';

import { router } from 'expo-router';

export default function AddItem() {

const [item,setItem] = useState('');
const [quantity,setQuantity] = useState('');
const [expiry,setExpiry] = useState('');

const saveItem = async () => {

if(item === ''){

Alert.alert(
'Error',
'Enter item name'
);

return;

}

try {

await addDoc(
collection(db,'pantry'),
{
name:item,
stock:quantity,
expiry:expiry
}
);

Alert.alert(
'Success',
'Item Added Successfully'
);

router.replace('/pantry');

}

catch(error:any){

Alert.alert(
'Firebase Error',
error.message
);

}

};

const speakItem = () => {

if(item === ''){

Speech.speak(
'Please enter item name'
);

}

else{

Speech.speak(
'Item is ' + item
);

}

};

return(

<LinearGradient
colors={['#0B1020','#151B2F','#1E293B']}
style={{flex:1}}
>

<View style={styles.container}>

<Text style={styles.title}>
📦 Add Pantry Item
</Text>

<TextInput
placeholder="Item Name"
placeholderTextColor="#94A3B8"
style={styles.input}
value={item}
onChangeText={setItem}
/>

<TextInput
placeholder="Quantity"
placeholderTextColor="#94A3B8"
style={styles.input}
value={quantity}
onChangeText={setQuantity}
/>

<TextInput
placeholder="Expiry Date"
placeholderTextColor="#94A3B8"
style={styles.input}
value={expiry}
onChangeText={setExpiry}
/>

<TouchableOpacity
style={styles.button}
onPress={saveItem}
>

<Text style={styles.buttonText}>
Save Item
</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.voiceButton}
onPress={speakItem}
>

<Text style={styles.buttonText}>
🎤 Speak Item
</Text>

</TouchableOpacity>

</View>

</LinearGradient>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
justifyContent:'center'
},

title:{
fontSize:32,
fontWeight:'bold',
marginBottom:30,
textAlign:'center',
color:'white'
},

input:{
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)',
padding:16,
marginBottom:15,
borderRadius:16,
color:'white',
fontSize:16
},

button:{
backgroundColor:'#4F46E5',
padding:16,
borderRadius:16,
marginTop:12,
elevation:5
},

voiceButton:{
backgroundColor:'#06B6D4',
padding:16,
borderRadius:16,
marginTop:12,
elevation:5
},

buttonText:{
color:'white',
textAlign:'center',
fontWeight:'bold',
fontSize:16
}

});