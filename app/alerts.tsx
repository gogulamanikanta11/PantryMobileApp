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

import {
sendNotification
} from '../utils/notifications';

export default function AlertsScreen(){

const [alerts,setAlerts]=useState<any[]>([]);

const loadAlerts = async () => {

const querySnapshot =
await getDocs(
collection(db,'pantry')
);

const data:any[] = [];

querySnapshot.forEach((doc)=>{

const item:any = doc.data();

const expiryText =
item.expiry?.toString() || '';

const expiryNumber =
parseInt(expiryText);

if(expiryNumber <= 3){

data.push(item);

}

});

setAlerts(data);

if(data.length > 0){

try{
sendNotification();
}
catch(error){
console.log(error);
}

}

};

useEffect(()=>{

loadAlerts();

},[]);

return(

<LinearGradient
colors={['#0B1020','#151B2F','#1E293B']}
style={{flex:1}}
>

<ScrollView style={styles.container}>

<Text style={styles.title}>
⚠️ Expiry Alerts
</Text>

{alerts.length === 0 ? (

<View style={styles.emptyCard}>

<Text style={styles.noAlert}>
✅ No Expiry Alerts
</Text>

<Text style={styles.subText}>
All pantry items are safe
</Text>

</View>

) : (

alerts.map((item,index)=>(

<View
key={index}
style={styles.card}
>

<Text style={styles.item}>
🛒 {item.name}
</Text>

<Text style={styles.expiry}>
Expires in {item.expiry} days
</Text>

</View>

))

)}

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
marginBottom:25,
textAlign:'center',
color:'white'
},

card:{
padding:20,
borderRadius:20,
marginBottom:15,
backgroundColor:'rgba(239,68,68,0.15)',
borderWidth:1,
borderColor:'rgba(239,68,68,0.4)'
},

item:{
fontSize:20,
fontWeight:'bold',
color:'white'
},

expiry:{
marginTop:10,
fontSize:16,
color:'#FCA5A5'
},

emptyCard:{
padding:25,
borderRadius:20,
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)',
alignItems:'center'
},

noAlert:{
fontSize:20,
fontWeight:'bold',
color:'#22C55E'
},

subText:{
marginTop:10,
fontSize:15,
color:'#94A3B8'
}

});