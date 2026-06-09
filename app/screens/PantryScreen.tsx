import React, {
useEffect,
useState
} from 'react';

import { router } from 'expo-router';

import {
collection,
getDocs
} from 'firebase/firestore';

import { db } from '../../firebase/config';

import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Alert,
} from 'react-native';

export default function PantryScreen() {

const [items,setItems]=useState<any[]>([]);

const loadItems=async()=>{

try{

const querySnapshot=
await getDocs(
collection(db,'pantry')
);

const data:any[]=[];

querySnapshot.forEach((doc)=>{

data.push({
id:doc.id,
...doc.data()
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

const deleteItem=(name:string)=>{

Alert.alert(
'Deleted',
`${name} removed`
);

};

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>
My Pantry
</Text>

{items.map((item,index)=>(

<View
key={index}
style={styles.card}
>

<View>

<Text>
{item.name}
</Text>

<Text
style={{
color:'gray',
marginTop:5
}}
>
Expiry: {item.expiry}
</Text>

<Text
style={{
color:
item.stock <= 1
? 'red'
: 'green'
}}
>
Stock: {item.stock}
</Text>

<TouchableOpacity
onPress={() => deleteItem(item.name)}
>

<Text
style={{
color:'red',
marginTop:10
}}
>
Delete
</Text>

</TouchableOpacity>

</View>

</View>

))}

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/additem')}
>

<Text style={styles.buttonText}>
Add New Item
</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/alerts')}
>

<Text style={styles.buttonText}>
View Alerts
</Text>

</TouchableOpacity>

<TouchableOpacity
style={styles.button}
onPress={() => router.push('/profile')}
>

<Text style={styles.buttonText}>
Profile
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

);

}

const styles = StyleSheet.create({

container: {
flex: 1,
padding: 20,
backgroundColor: '#fff'
},

title: {
fontSize: 30,
fontWeight: 'bold',
marginTop: 60,
marginBottom: 20,
color: 'green'
},

card: {
padding: 20,
borderWidth: 1,
borderRadius: 10,
marginBottom: 15
},

button: {
backgroundColor: 'green',
padding: 15,
borderRadius: 10,
marginTop: 10
},

buttonText: {
color: 'white',
textAlign: 'center',
fontWeight: 'bold'
}

});