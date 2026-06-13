import React from 'react';

import {
View,
Text,
StyleSheet
} from 'react-native';

import { pantryItems } from '../../backend/data/pantryData';

export default function NotificationScreen(){

const alerts=
pantryItems.filter(
item=>
item.stock<=1
);

return(

<View style={styles.container}>

<Text style={styles.title}>
Alerts
</Text>

{

alerts.map((item,index)=>(

<View
key={index}
style={styles.card}
>

<Text>

⚠️
{item.name}

</Text>

<Text>

Low Stock

</Text>

</View>

))

}

</View>

);

}

const styles=
StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:'#fff'
},

title:{
fontSize:30,
fontWeight:'bold',
marginTop:60,
marginBottom:20,
color:'green'
},

card:{
padding:20,
borderWidth:1,
borderRadius:10,
marginBottom:15
}

});