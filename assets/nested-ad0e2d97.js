import"./modulepreload-polyfill-3cfb730f.js";/* empty css               */let w="https://effectuall.github.io/Simulations/";const d=document.getElementById("panel"),y=document.getElementById("content"),l=document.getElementById("viewer"),a=document.getElementById("filterInput"),S=document.getElementById("exitSearchButton"),B=document.getElementById("expandButton"),v=document.getElementById("button"),b=document.getElementById("panelScrim"),m=document.querySelector("#sections > a"),x=m.href,u={},f=new Map,p=document.createElement("div");let h=null;I();async function I(){y.appendChild(p),y.classList.toggle("minimal");const t=await(await fetch("files.json")).json(),n=await(await fetch("tags.json")).json();for(const e in t){const i=t[e],c=document.createElement("h2");c.textContent=e,c.setAttribute("data-category",e),p.appendChild(c);for(let o=0;o<i.length;o++){const s=i[o],r=q(s);p.appendChild(r),u[s]=r,f.set(s,"Simulations/"+s+".html")}}if(window.location.hash!==""){const e=window.location.hash.substring(13);f.has(e)===!0&&(L(e),l.src=f.get(e),l.style.display="unset")}a.value=j(),a.value!==""?(d.classList.add("searchFocused"),g(t,n)):k(""),a.onfocus=function(){d.classList.add("searchFocused")},a.onblur=function(){a.value===""&&d.classList.remove("searchFocused")},S.onclick=function(){a.value="",g(t,n),d.classList.remove("searchFocused")},a.addEventListener("input",function(){g(t,n)}),B.addEventListener("click",function(e){e.preventDefault(),d.classList.toggle("open")}),b.onclick=function(e){e.preventDefault(),d.classList.toggle("open")},/(iPad|iPhone|iPod)/g.test(navigator.userAgent)&&(l.style.width=getComputedStyle(l).width,l.style.height=getComputedStyle(l).height,l.setAttribute("scrolling","no"))}function q(t){const n=`
        <div class="card">
            <a href="${w}${t}.html" target="viewer">
                <div class="cover">
                    
                </div>
                <div class="title">${E(t)}</div>
            </a>
        </div>
    `,e=H(n);return e.querySelector('a[target="viewer"]').addEventListener("click",function(i){i.button!==0||i.ctrlKey||i.altKey||i.metaKey||L(t)}),e}function L(t){h!==null&&u[h].classList.remove("selected"),u[t].classList.add("selected"),window.location.hash="Simulations/"+t,l.focus(),l.style.display="unset",d.classList.remove("open"),h=t,v.style.display="block",v.href=w+h+".html"}function g(t,n){let e=a.value.trim();e=e.replace(/\s+/gi," "),e!==""?window.history.replaceState({},"","?q="+e+window.location.hash):window.history.replaceState({},"",window.location.pathname+window.location.hash);const i=new RegExp(e,"gi");for(const c in t){const o=t[c];for(let s=0;s<o.length;s++)C(o[s],i,n)}F(t),k(e)}function k(t){if(t){const n=m.href.split(/[?#]/)[0];m.href=`${n}?q=${t}`}else m.href=x}function C(t,n,e){const i=u[t],c=E(t);t in e&&(t+=" "+e[t].join(" "));const o=t.match(n);let s;if(o&&o.length>0){i.classList.remove("hidden");for(let r=0;r<o.length;r++)s=c.replace(o[r],"<b>"+o[r]+"</b>");i.querySelector(".title").innerHTML=s}else i.classList.add("hidden"),i.querySelector(".title").innerHTML=c}function E(t){const n=t.split("_");return n.shift(),n.join("  ")}function F(t){for(const n in t){let e=!0;const i=t[n];for(let o=0;o<i.length;o++){const s=i[o];if(u[s].classList.contains("hidden")===!1){e=!1;break}}const c=document.querySelector('h2[data-category="'+n+'"]');e?c.classList.add("hidden"):c.classList.remove("hidden")}}function j(){const t=window.location.search;return t.indexOf("?q=")!==-1?decodeURI(t.substr(3)):""}function H(t){const n=document.createElement("div");return n.innerHTML=t.trim(),n.firstChild}
