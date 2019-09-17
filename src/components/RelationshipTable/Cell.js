import React from 'react';
import { timeout } from 'q';
// import {attr,animate} from "svg.js";
export const Cell = ({ node, neighbor, property, propertyToEdit, canEdit, onBlur }) => {
    const highLightEl = ()=>{
        var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate")
            anim.setAttribute("begin", "indefinite")
            anim.setAttribute("from", 10)
            anim.setAttribute("to", 20)
            anim.setAttribute("fill", "freeze")
            anim.setAttribute("dur", "1s")
            anim.setAttribute("repeatCount", "indefinite")
            anim.setAttribute("attributeName", "r")
            // anim.setAttribute("stroke-width",3)
        if(node !== undefined)
        {
            console.log("node");
            let svgEl = document.getElementById(node.id);
            if(!svgEl)
            {
                alert(`Not found node on maps`);
                return;
            }
            // svgEl.scrollIntoView();   
            svgEl.setAttribute("stroke-width",3);
            svgEl.setAttribute("stroke","red"); 
            svgEl.appendChild(anim);
            anim.beginElement();
            setTimeout(function() { 
                anim.parentElement.removeChild(anim); 
                svgEl.setAttribute("stroke-width",0);
                svgEl.setAttribute("stroke","none");
            }, 2000);
          
        }
        if(neighbor !== undefined)
        {
            // console.log("neighbor",neighbor);       
            let svgEl = document.getElementById(neighbor.id);
            if(!svgEl)
            {
                alert(`Not found node on maps`);
                return;
            }
            // svgEl.scrollIntoView();
            // console.log(svgEl);   
            svgEl.setAttribute("stroke-width",3);
            svgEl.setAttribute("stroke","red");
            svgEl.appendChild(anim);
            anim.beginElement();
            setTimeout(function() 
            { 
                anim.parentElement.removeChild(anim);
                svgEl.setAttribute("stroke-width",0);
                svgEl.setAttribute("stroke","none");
            }, 2000);

        }
        
    }
    if (typeof canEdit !== "boolean") canEdit = false;
    return (
        <div
            style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
            contentEditable={canEdit}
            suppressContentEditableWarning={canEdit}
            onBlur={e => canEdit ? onBlur(e) : null}
            dangerouslySetInnerHTML={{
                __html: canEdit ? neighbor[propertyToEdit] : node[property]
            }}
            onClick= {()=>{highLightEl(node,neighbor)} }
        />
    )
}