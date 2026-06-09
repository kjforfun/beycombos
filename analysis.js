const Analysis={
data:[],
init(data){this.data=data},
filter({keyword='',blade='',ratchet='',bit=''}={}){
keyword=keyword.toLowerCase();
return this.data.filter(r=>{
const text=[r.英文,r.上蓋,r.固鎖,r.軸].join(' ').toLowerCase();
return (!keyword||text.includes(keyword))
&&(
  !blade ||
  (
    r.上蓋 && r.上蓋.trim()
      ? r.上蓋 === blade
      : `【待釐正】(${r.英文})` === blade
  )
)
&&(!ratchet||r.固鎖===ratchet)
&&(!bit||r.軸===bit);
});
},
countBy(rows,key){
const m={};
rows.forEach(r=>m[r[key]]=(m[r[key]]||0)+1);
return Object.entries(m).sort((a,b)=>b[1]-a[1]);
}
};
