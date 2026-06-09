import React,{
useEffect,
useState
} from 'react';

import {
View,
Text,
StyleSheet,
ScrollView
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
collection,
getDocs
} from 'firebase/firestore';

import { db } from '../firebase/config';

export default function AnalyticsScreen(){

const [total,setTotal] =
useState(0);

const [lowStock,setLowStock] =
useState(0);

const [expiring,setExpiring] =
useState(0);

const loadAnalytics = async () => {

const querySnapshot =
await getDocs(
collection(db,'pantry')
);

let totalItems = 0;
let lowStockItems = 0;
let expiringItems = 0;

querySnapshot.forEach((doc)=>{

const item:any = doc.data();

totalItems++;

const stock =
parseInt(item.stock);

const expiry =
parseInt(item.expiry);

if(stock <= 1){

lowStockItems++;

}

if(expiry <= 3){

expiringItems++;

}

});

setTotal(totalItems);
setLowStock(lowStockItems);
setExpiring(expiringItems);

};

useEffect(()=>{

loadAnalytics();

},[]);

return(

<LinearGradient
colors={['#0B1020','#151B2F','#1E293B']}
style={{flex:1}}
>

<ScrollView style={styles.container}>

<Text style={styles.title}>
📊 Analytics Dashboard
</Text>

<Text style={styles.subtitle}>
Real-time pantry insights
</Text>

<View style={styles.card}>

<Text style={styles.label}>
📦 Total Pantry Items
</Text>

<Text style={styles.value}>
{total}
</Text>

</View>

<View style={styles.card}>

<Text style={styles.label}>
⚠️ Low Stock Items
</Text>

<Text style={[styles.value,{color:'#F59E0B'}]}>
{lowStock}
</Text>

</View>

<View style={styles.card}>

<Text style={styles.label}>
🔥 Expiring Soon
</Text>

<Text style={[styles.value,{color:'#EF4444'}]}>
{expiring}
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
marginBottom:25,
marginTop:8
},

card:{
padding:25,
borderRadius:20,
marginBottom:20,
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)'
},

label:{
fontSize:18,
fontWeight:'bold',
color:'white'
},

value:{
fontSize:42,
fontWeight:'bold',
marginTop:12,
color:'#22C55E'
}

});