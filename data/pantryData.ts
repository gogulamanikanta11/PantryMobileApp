export let pantryItems = [

{
id:1,
name:'Milk',
expiry:'2 Days',
stock:1
},

{
id:2,
name:'Rice',
expiry:'10 Days',
stock:5
}

];

export function addPantryItem(name:string){

pantryItems.push({

id:Date.now(),

name,

expiry:'Unknown',

stock:1

});

}