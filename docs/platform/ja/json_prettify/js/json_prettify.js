const a=document.getElementById('jsonInput'),b=document.getElementById('jsonOutput');
function formatJSON(){
    const c=a.value;
    try{const d=JSON.parse(c);b.textContent=JSON.stringify(d,null,2);}
    catch(e){b.textContent="無効なJSON形式です。\n"+e;}
}
function minifyJSON(){
    const c=b.textContent;
    try{const d=JSON.parse(c);a.value=JSON.stringify(d);}
    catch(e){a.value="無効な整形済みJSONです。\n"+e;}
}