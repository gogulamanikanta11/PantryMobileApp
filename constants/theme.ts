import { Platform } from 'react-native';

export const COLORS = {

background1:'#0f2027',

background2:'#203a43',

background3:'#2c5364',

primary:'#22c55e',

secondary:'#4ade80',

card:'rgba(255,255,255,0.1)',

border:'rgba(255,255,255,0.2)',

text:'white',

subtext:'#d1d5db',

danger:'#ff6b6b',

shadow:'#000'

};

export const Colors = {

light: {

text:'#ffffff',

background:'#0f2027',

tint:'#22c55e',

icon:'#d1d5db',

tabIconDefault:'#9ca3af',

tabIconSelected:'#22c55e',

card:'rgba(255,255,255,0.1)'

},

dark: {

text:'#ffffff',

background:'#0f2027',

tint:'#22c55e',

icon:'#d1d5db',

tabIconDefault:'#9ca3af',

tabIconSelected:'#22c55e',

card:'rgba(255,255,255,0.1)'

}

};

export const Fonts = Platform.select({

ios: {

sans:'system-ui',

serif:'ui-serif',

rounded:'ui-rounded',

mono:'ui-monospace'

},

default: {

sans:'normal',

serif:'serif',

rounded:'normal',

mono:'monospace'

},

web: {

sans:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

serif:"Georgia, 'Times New Roman', serif",

rounded:"'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",

mono:"SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"

}

});