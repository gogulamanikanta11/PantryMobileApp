import React,{
createContext,
useState
} from 'react';

export const ThemeContext =
createContext<any>(null);

export const ThemeProvider = ({
children
}:any) => {

const [dark,setDark] =
useState(false);

return(

<ThemeContext.Provider
value={{
dark,
setDark
}}
>

{children}

</ThemeContext.Provider>

);

};