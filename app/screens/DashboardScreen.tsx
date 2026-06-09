import React from 'react';
import { router } from 'expo-router';

import {
View,
Text,
StyleSheet,
TouchableOpacity,
ScrollView
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {

return (

<LinearGradient
colors={['#0B1020','#151B2F','#1E293B']}
style={{flex:1}}
>

<ScrollView style={styles.container}>

<Text style={styles.welcome}>
👋 Welcome Back
</Text>

<Text style={styles.title}>
Smart Pantry AI
</Text>

<View style={styles.row}>

<View style={styles.statCard}>
<Text style={styles.statIcon}>📦</Text>
<Text style={styles.statValue}>12</Text>
<Text style={styles.statLabel}>Items</Text>
</View>

<View style={styles.statCard}>
<Text style={styles.statIcon}>⚠️</Text>
<Text style={styles.statValue}>3</Text>
<Text style={styles.statLabel}>Alerts</Text>
</View>

</View>

<View style={styles.row}>

<View style={styles.statCard}>
<Text style={styles.statIcon}>📉</Text>
<Text style={styles.statValue}>2</Text>
<Text style={styles.statLabel}>Low Stock</Text>
</View>

<View style={styles.statCard}>
<Text style={styles.statIcon}>🤖</Text>
<Text style={styles.statValue}>AI</Text>
<Text style={styles.statLabel}>Ready</Text>
</View>

</View>

<Text style={styles.sectionTitle}>
Quick Actions
</Text>

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/pantry')}
>
<Text style={styles.buttonText}>
📦 Manage Pantry
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/analytics')}
>
<Text style={styles.buttonText}>
📊 Analytics
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/predict')}
>
<Text style={styles.buttonText}>
🤖 AI Prediction
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/recipes')}
>
<Text style={styles.buttonText}>
👨‍🍳 AI Recipes
</Text>
</TouchableOpacity>
<TouchableOpacity
style={styles.button}
onPress={() => router.push('/scanner')}
>
<Text style={styles.buttonText}>
📷 Scan Product
</Text>
</TouchableOpacity>

</ScrollView>

</LinearGradient>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20
},

welcome:{
marginTop:60,
fontSize:18,
color:'#94A3B8'
},

title:{
fontSize:34,
fontWeight:'bold',
color:'white',
marginBottom:25
},

row:{
flexDirection:'row',
justifyContent:'space-between',
marginBottom:15
},

statCard:{
width:'48%',
padding:20,
borderRadius:20,
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)',
alignItems:'center'
},

statIcon:{
fontSize:28
},

statValue:{
fontSize:30,
fontWeight:'bold',
color:'white',
marginTop:10
},

statLabel:{
fontSize:14,
color:'#94A3B8',
marginTop:5
},

sectionTitle:{
fontSize:22,
fontWeight:'bold',
color:'white',
marginTop:15,
marginBottom:15
},

button:{
backgroundColor:'#4F46E5',
padding:16,
borderRadius:16,
marginBottom:12
},

buttonText:{
color:'white',
fontSize:16,
fontWeight:'bold',
textAlign:'center'
}

});