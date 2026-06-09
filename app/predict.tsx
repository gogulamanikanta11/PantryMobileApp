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

export default function PredictScreen(){

const [predictions,setPredictions] =
useState<any[]>([]);

const loadPredictions = async () => {

const querySnapshot =
await getDocs(
collection(db,'pantry')
);

const data:any[] = [];

querySnapshot.forEach((doc)=>{

const item:any = doc.data();

const stock =
parseInt(item.stock);

let prediction =
'Fresh';

let color =
'#22C55E';

if(stock <= 1){

prediction =
'🔥 Use Immediately';

color =
'#EF4444';

}

else if(stock <= 3){

prediction =
'⚠️ May Expire Soon';

color =
'#F59E0B';

}

data.push({

name:item.name,
prediction,
color

});

});

setPredictions(data);

};

useEffect(()=>{

loadPredictions();

},[]);

return(

<LinearGradient
colors={['#0B1020','#151B2F','#1E293B']}
style={{flex:1}}
>

<ScrollView style={styles.container}>

<Text style={styles.title}>
🤖 AI Prediction
</Text>

<Text style={styles.subtitle}>
Smart expiry insights powered by AI
</Text>

{predictions.map((item,index)=>(

<View
key={index}
style={styles.card}
>

<Text style={styles.item}>
🛒 {item.name}
</Text>

<Text
style={[
styles.prediction,
{
color:item.color
}
]}
>
{item.prediction}
</Text>

</View>

))}

{predictions.length === 0 && (

<View style={styles.emptyCard}>

<Text style={styles.emptyTitle}>
📦 No Items Found
</Text>

<Text style={styles.emptyText}>
Add pantry items to see AI predictions
</Text>

</View>

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
padding:20,
borderRadius:20,
marginBottom:15,
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)'
},

item:{
fontSize:20,
fontWeight:'bold',
color:'white'
},

prediction:{
marginTop:10,
fontSize:16,
fontWeight:'bold'
},

emptyCard:{
padding:25,
borderRadius:20,
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)',
alignItems:'center'
},

emptyTitle:{
fontSize:20,
fontWeight:'bold',
color:'white'
},

emptyText:{
marginTop:10,
fontSize:15,
color:'#94A3B8'
}

});