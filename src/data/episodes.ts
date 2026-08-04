export type Episode={season:number;episode:number;title:string;key:string};
const COUNTS=[24,24,24,24,24,24,24,24,24,24,24];
const TITLES:Record<string,string>={"1-1":"The Good Son","1-24":"My Coffee with Niles","2-3":"The Matchmaker","3-1":"She's the Boss","3-17":"High Crane Drifter","3-19":"Crane vs. Crane","3-21":"Where There's Smoke There's Fired","3-23":"The Focus Group","3-24":"You Can Go Home Again","4-1":"The Two Mrs. Cranes","5-14":"The Ski Lodge","6-17":"Dinner Party","7-15":"Out with Dad","8-9":"Frasier's Edge","9-14":"Juvenilia","10-14":"Daphne Does Dinner","11-24":"Goodnight, Seattle"};
export const EPISODES:Episode[]=COUNTS.flatMap((count,s)=>Array.from({length:count},(_,i)=>{const key=`${s+1}-${i+1}`;return {season:s+1,episode:i+1,key,title:TITLES[key]||`Episode ${i+1}`}}));
export const episodeFor=(season:number,episode:number)=>EPISODES.find(e=>e.season===season&&e.episode===episode);
export const episodesForSeason=(season:number)=>EPISODES.filter(e=>e.season===season);
