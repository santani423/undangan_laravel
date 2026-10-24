const t=new Set;let n=!0;function o(e){n=e}function s(e,a=1){n&&t.forEach(r=>r({spot:e,strength:a}))}function c(e){return t.add(e),()=>{t.delete(e)}}export{s as c,c as o,o as s};
