import React, {
useEffect,
useState
} from 'react';

import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Alert
} from 'react-native';

import {
collection,
getDocs,
deleteDoc,
doc
} from 'firebase/firestore';

import { db } from '../backend/firebase/config';

import { router } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';

import {
Ionicons
} from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function PantryScreen() {

const [items,setItems]=useState<any[]>([]);

const loadItems = async () => {

try{

const querySnapshot =
await getDocs(
collection(db,'pantry')
);

const data:any[] = [];

querySnapshot.forEach((document)=>{

data.push({
id:document.id,
...document.data()
});

});

setItems(data);

}

catch(error){

console.log(error);

}

};

useEffect(()=>{

loadItems();

},[]);

const deleteItem = async (id:string) => {

await deleteDoc(
doc(db,'pantry',id)
);

Alert.alert(
'Deleted',
'Item Removed'
);

loadItems();

};

return(

<LinearGradient
colors={[
COLORS.background1,
COLORS.background2,
COLORS.background3
]}
style={{flex:1}}
>

<ScrollView style={styles.container}>

<Text style={styles.title}>
Smart Pantry AI
</Text>

{items.map((item,index)=>(

<View
key={index}
style={styles.card}
>

<Text style={styles.itemName}>
{item.name}
</Text>

<Text style={styles.expiry}>
Expiry: {item.expiry}
</Text>

<Text style={styles.stock}>
Stock: {item.stock}
</Text>

<TouchableOpacity
onPress={()=>
deleteItem(item.id)
}
>

<Text style={styles.deleteText}>
Delete
</Text>

</TouchableOpacity>

</View>

))}

<TouchableOpacity
style={styles.button}
onPress={()=>
router.push('/additem')
}
>

<View style={styles.buttonRow}>

<Ionicons
name="add-circle"
size={24}
color="white"
/>

<Text style={styles.buttonText}>
Add New Item
</Text>

</View>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={()=>
router.push('/alerts')
}
>

<View style={styles.buttonRow}>

<Ionicons
name="notifications"
size={24}
color="white"
/>

<Text style={styles.buttonText}>
View Alerts
</Text>

</View>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={()=>
router.push('/recipes')
}
>

<View style={styles.buttonRow}>

<Ionicons
name="restaurant"
size={24}
color="white"
/>

<Text style={styles.buttonText}>
AI Recipes
</Text>

</View>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={()=>
router.push('/settings')
}
>

<View style={styles.buttonRow}>

<Ionicons
name="settings"
size={24}
color="white"
/>

<Text style={styles.buttonText}>
Settings
</Text>

</View>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={()=>
router.push('/predict')
}
>

<View style={styles.buttonRow}>

<Ionicons
name="sparkles"
size={24}
color="white"
/>

<Text style={styles.buttonText}>
AI Prediction
</Text>

</View>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={()=>
router.push('/analytics')
}
>

<View style={styles.buttonRow}>

<Ionicons
name="bar-chart"
size={24}
color="white"
/>

<Text style={styles.buttonText}>
Analytics
</Text>

</View>

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

title:{
fontSize:34,
fontWeight:'bold',
marginTop:60,
marginBottom:25,
color:'white',
textAlign:'center'
},

card:{
padding:20,
borderRadius:20,
marginBottom:15,
backgroundColor:'rgba(255,255,255,0.1)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.2)'
},

itemName:{
fontSize:20,
fontWeight:'bold',
color:'white'
},

expiry:{
color:'#d1d5db',
marginTop:8,
fontSize:15
},

stock:{
color:'#4ade80',
marginTop:5,
fontSize:16,
fontWeight:'bold'
},

deleteText:{
color:'#ff6b6b',
marginTop:12,
fontWeight:'bold'
},

button:{
backgroundColor:'#22c55e',
padding:16,
borderRadius:15,
marginTop:12,
shadowColor:'#000',
shadowOpacity:0.3,
shadowRadius:5,
elevation:5
},

buttonRow:{
flexDirection:'row',
justifyContent:'center',
alignItems:'center',
gap:10
},

buttonText:{
color:'white',
textAlign:'center',
fontWeight:'bold',
fontSize:16
}

});