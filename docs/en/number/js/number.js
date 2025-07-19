const a=document.getElementById('inputValue'),b=document.getElementById('inputRadix'),c=document.getElementById('outputBinary'),d=document.getElementById('outputOctal'),e=document.getElementById('outputDecimal'),f=document.getElementById('outputHexadecimal'),g=document.getElementById('errorMessage');
function h(){
    const i=a.value.trim(),j=parseInt(b.value);
    g.textContent='';
    if(i===''){c.value=d.value=e.value=f.value='';return;}

    let k=!0;
    if(j===2&&!/^[01]+$/.test(i))k=!1;
    else if(j===8&&!/^[0-7]+$/.test(i))k=!1;
    else if(j===10&&!/^[0-9]+$/.test(i))k=!1;
    else if(j===16&&!/^[0-9a-fA-F]+$/.test(i))k=!1;

    if(!k){
        g.textContent=`The input value contains invalid characters for base ${j}.`;
        c.value=d.value=e.value=f.value='';
        return;
    }

    const l=parseInt(i,j);

    if(isNaN(l)){
        g.textContent=`The input value could not be correctly interpreted as a base ${j} number.`;
        c.value=d.value=e.value=f.value='';
        return;
    }

    const m=Number.MAX_SAFE_INTEGER || 9007199254740991; // fallback
    if(l > m){
        g.textContent=`The input value is too large (exceeds the safe range for JavaScript Number type).`;
        c.value=d.value=e.value=f.value='';
        return;
    }

    c.value=l.toString(2);
    d.value=l.toString(8);
    e.value=l.toString(10);
    f.value=l.toString(16).toUpperCase();
}
a.addEventListener('input',h);
b.addEventListener('change',h);
h();
