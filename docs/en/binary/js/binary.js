const a=document.getElementById('inputValue'),b=document.getElementById('inputUnit'),c=document.getElementById('resultKib'),d=document.getElementById('resultMib'),e=document.getElementById('resultGib'),f=document.getElementById('resultTib'),g=document.getElementById('resultKb'),h=document.getElementById('resultMb'),i=document.getElementById('resultGb'),j=document.getElementById('resultTb');
const k=1e3,l=1e6,m=1e9,n=1e12,o=1024,p=1024**2,q=1024**3,r=1024**4;
function s(t){if(isNaN(t))return'';let u=t.toFixed(10);if(u.includes('e'))return t.toExponential(6);return u.replace(/\.?0+$/,'');}
function v(){
    const w=parseFloat(a.value),x=b.value;
    if(isNaN(w)){c.value=d.value=e.value=f.value=g.value=h.value=i.value=j.value='';return;}
    let y;
    switch(x){
        case'kib':y=w*o;break;case'mib':y=w*p;break;case'gib':y=w*q;break;case'tib':y=w*r;break;
        case'kb':y=w*k;break;case'mb':y=w*l;break;case'gb':y=w*m;break;case'tb':y=w*n;break;
        default:y=0;
    }
    c.value=s(y/o);d.value=s(y/p);e.value=s(y/q);f.value=s(y/r);
    g.value=s(y/k);h.value=s(y/l);i.value=s(y/m);j.value=s(y/n);
}
a.addEventListener('input',v);b.addEventListener('change',v);v();