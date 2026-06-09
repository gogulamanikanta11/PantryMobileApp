import React, { useState } from 'react';

import {
View,
Text,
TouchableOpacity,
StyleSheet
} from 'react-native';

import {
CameraView,
useCameraPermissions
} from 'expo-camera';

export default function ScannerScreen() {

const [permission, requestPermission] =
useCameraPermissions();

const [scanned, setScanned] =
useState(false);

if (!permission) {

return <View />;

}

if (!permission.granted) {

return (

<View style={styles.container}>

<Text style={styles.text}>
Camera permission required
</Text>

<TouchableOpacity
style={styles.button}
onPress={requestPermission}
>

<Text style={styles.buttonText}>
Grant Permission
</Text>

</TouchableOpacity>

</View>

);

}

return (

<View style={{ flex: 1 }}>

<CameraView
style={{ flex: 1 }}
barcodeScannerSettings={{
barcodeTypes: [
'qr',
'ean13',
'ean8',
'code128'
]
}}
onBarcodeScanned={
scanned
? undefined
: ({ data }) => {

setScanned(true);

alert(`Barcode: ${data}`);

}
}
/>

{scanned && (

<TouchableOpacity
style={styles.scanAgain}
onPress={() => setScanned(false)}
>

<Text style={styles.buttonText}>
Scan Again
</Text>

</TouchableOpacity>

)}

</View>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
justifyContent:'center',
alignItems:'center',
backgroundColor:'#0B1020'
},

text:{
color:'white',
fontSize:18,
marginBottom:20
},

button:{
backgroundColor:'#22C55E',
padding:15,
borderRadius:12
},

buttonText:{
color:'white',
fontWeight:'bold'
},

scanAgain:{
position:'absolute',
bottom:40,
alignSelf:'center',
backgroundColor:'#22C55E',
padding:15,
borderRadius:12
}

});