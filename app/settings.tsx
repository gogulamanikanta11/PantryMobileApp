import React,{
useContext
} from 'react';

import {
View,
Text,
StyleSheet,
Switch,
ScrollView
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
ThemeContext
} from '../context/ThemeContext';

export default function SettingsScreen(){

const {
dark,
setDark
} = useContext(
ThemeContext
);

return(

<LinearGradient
colors={['#0B1020','#151B2F','#1E293B']}
style={{flex:1}}
>

<ScrollView style={styles.container} testID="settings-screen">

<Text style={styles.title}>
⚙️ Settings
</Text>

<Text style={styles.subtitle}>
Customize your Smart Pantry AI
</Text>

<View style={styles.card} testID="dark-mode-section">

<View style={styles.row}>

<Text style={styles.label}>
🌙 Dark Mode
</Text>

<Switch
testID="dark-mode-switch"
value={dark}
onValueChange={setDark}
/>

</View>

</View>

<View style={styles.card} testID="notifications-section">

<Text style={styles.label}>
🔔 Notifications
</Text>

<Text style={styles.description}>
Expiry alerts are enabled
</Text>

</View>

<View style={styles.card} testID="voice-section">

<Text style={styles.label}>
🎤 Voice Assistant
</Text>

<Text style={styles.description}>
Speech support enabled
</Text>

</View>

<View style={styles.card} testID="about-section">

<Text style={styles.label}>
🤖 Smart Pantry AI
</Text>

<Text style={styles.description}>
Version 1.0.0
</Text>

</View>

</ScrollView>

</LinearGradient>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20
},

title:{
fontSize:32,
fontWeight:'bold',
marginTop:60,
textAlign:'center',
color:'white'
},

subtitle:{
fontSize:15,
textAlign:'center',
color:'#94A3B8',
marginTop:8,
marginBottom:25
},

card:{
padding:20,
borderRadius:20,
marginBottom:15,
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)'
},

row:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center'
},

label:{
fontSize:18,
fontWeight:'bold',
color:'white'
},

description:{
marginTop:10,
fontSize:14,
color:'#94A3B8'
}

});