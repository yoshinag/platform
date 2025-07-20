// Get DOM elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

// Function to generate MD5 hash
async function generateMD5Hash() {
    try {
        const input = inputText.value;
        if (!input) {
            outputText.value = '';
            return;
        }
        
        // MD5 implementation
        const md5 = function(d){
            const r = M(V(Y(X(d),8*d.length)));
            return r.toLowerCase();
        };
        
        function M(d){
            for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);
            return f;
        }
        
        function X(d){
            for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;
            for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;
            return _;
        }
        
        function V(d){
            for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);
            return _;
        }
        
        function Y(d,_){
            d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;
            for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){
                var h=m,t=f,g=r,e=i;
                m=ff(m,f,r,i,d[n+0],7,-680876936),i=ff(i,m,f,r,d[n+1],12,-389564586),r=ff(r,i,m,f,d[n+2],17,606105819),f=ff(f,r,i,m,d[n+3],22,-1044525330);
                m=ff(m,f,r,i,d[n+4],7,-176418897),i=ff(i,m,f,r,d[n+5],12,1200080426),r=ff(r,i,m,f,d[n+6],17,-1473231341),f=ff(f,r,i,m,d[n+7],22,-45705983);
                m=ff(m,f,r,i,d[n+8],7,1770035416),i=ff(i,m,f,r,d[n+9],12,-1958414417),r=ff(r,i,m,f,d[n+10],17,-42063),f=ff(f,r,i,m,d[n+11],22,-1990404162);
                m=ff(m,f,r,i,d[n+12],7,1804603682),i=ff(i,m,f,r,d[n+13],12,-40341101),r=ff(r,i,m,f,d[n+14],17,-1502002290),f=ff(f,r,i,m,d[n+15],22,1236535329);
                m=gg(m,f,r,i,d[n+1],5,-165796510),i=gg(i,m,f,r,d[n+6],9,-1069501632),r=gg(r,i,m,f,d[n+11],14,643717713),f=gg(f,r,i,m,d[n+0],20,-373897302);
                m=gg(m,f,r,i,d[n+5],5,-701558691),i=gg(i,m,f,r,d[n+10],9,38016083),r=gg(r,i,m,f,d[n+15],14,-660478335),f=gg(f,r,i,m,d[n+4],20,-405537848);
                m=gg(m,f,r,i,d[n+9],5,568446438),i=gg(i,m,f,r,d[n+14],9,-1019803690),r=gg(r,i,m,f,d[n+3],14,-187363961),f=gg(f,r,i,m,d[n+8],20,1163531501);
                m=gg(m,f,r,i,d[n+13],5,-1444681467),i=gg(i,m,f,r,d[n+2],9,-51403784),r=gg(r,i,m,f,d[n+7],14,1735328473),f=gg(f,r,i,m,d[n+12],20,-1926607734);
                m=hh(m,f,r,i,d[n+5],4,-378558),i=hh(i,m,f,r,d[n+8],11,-2022574463),r=hh(r,i,m,f,d[n+11],16,1839030562),f=hh(f,r,i,m,d[n+14],23,-35309556);
                m=hh(m,f,r,i,d[n+1],4,-1530992060),i=hh(i,m,f,r,d[n+4],11,1272893353),r=hh(r,i,m,f,d[n+7],16,-155497632),f=hh(f,r,i,m,d[n+10],23,-1094730640);
                m=hh(m,f,r,i,d[n+13],4,681279174),i=hh(i,m,f,r,d[n+0],11,-358537222),r=hh(r,i,m,f,d[n+3],16,-722521979),f=hh(f,r,i,m,d[n+6],23,76029189);
                m=hh(m,f,r,i,d[n+9],4,-640364487),i=hh(i,m,f,r,d[n+12],11,-421815835),r=hh(r,i,m,f,d[n+15],16,530742520),f=hh(f,r,i,m,d[n+2],23,-995338651);
                m=ii(m,f,r,i,d[n+0],6,-198630844),i=ii(i,m,f,r,d[n+7],10,1126891415),r=ii(r,i,m,f,d[n+14],15,-1416354905),f=ii(f,r,i,m,d[n+5],21,-57434055);
                m=ii(m,f,r,i,d[n+12],6,1700485571),i=ii(i,m,f,r,d[n+3],10,-1894986606),r=ii(r,i,m,f,d[n+10],15,-1051523),f=ii(f,r,i,m,d[n+1],21,-2054922799);
                m=ii(m,f,r,i,d[n+8],6,1873313359),i=ii(i,m,f,r,d[n+15],10,-30611744),r=ii(r,i,m,f,d[n+6],15,-1560198380),f=ii(f,r,i,m,d[n+13],21,1309151649);
                m=ii(m,f,r,i,d[n+4],6,-145523070),i=ii(i,m,f,r,d[n+11],10,-1120210379),r=ii(r,i,m,f,d[n+2],15,718787259),f=ii(f,r,i,m,d[n+9],21,-343485551);
                m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e);
            }
            return Array(m,f,r,i);
        }
        
        function cmn(q,a,b,x,s,t){
            return safe_add(bit_rol(safe_add(safe_add(a,q),safe_add(x,t)),s),b);
        }
        
        function ff(a,b,c,d,x,s,t){
            return cmn(b&c|~b&d,a,b,x,s,t);
        }
        
        function gg(a,b,c,d,x,s,t){
            return cmn(b&d|c&~d,a,b,x,s,t);
        }
        
        function hh(a,b,c,d,x,s,t){
            return cmn(b^c^d,a,b,x,s,t);
        }
        
        function ii(a,b,c,d,x,s,t){
            return cmn(c^(b|~d),a,b,x,s,t);
        }
        
        function safe_add(x,y){
            var lsw=(x&0xFFFF)+(y&0xFFFF),msw=(x>>16)+(y>>16)+(lsw>>16);
            return(msw<<16)|(lsw&0xFFFF);
        }
        
        function bit_rol(num,cnt){
            return(num<<cnt)|(num>>>(32-cnt));
        }
        
        // Generate MD5 hash
        const hash = md5(input);
        outputText.value = hash;
    } catch (error) {
        outputText.value = 'Error: ' + error.message;
    }
}

// Function to clear both input and output
function clearText() {
    inputText.value = '';
    outputText.value = '';
    inputText.focus();
}

// Function to copy output to clipboard
function copyToClipboard() {
    if (!outputText.value) return;
    
    outputText.select();
    document.execCommand('copy');
    
    // Show temporary "Copied!" message
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Add event listeners
generateBtn.addEventListener('click', generateMD5Hash);
clearBtn.addEventListener('click', clearText);
copyBtn.addEventListener('click', copyToClipboard);