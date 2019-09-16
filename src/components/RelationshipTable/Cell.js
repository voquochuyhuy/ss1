import React from 'react';
import { timeout } from 'q';
// import {attr,animate} from "svg.js";
export const Cell = ({ node, neighbor, property, propertyToEdit, canEdit, onBlur }) => {
    const highLightEl = ()=>{
        
        if(node !== undefined)
        {
            let svgEl = document.getElementById(node.id);
            
            var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate")
            anim.setAttribute("begin", "indefinite")
            anim.setAttribute("from", 10)
            anim.setAttribute("to", 50)
            anim.setAttribute("fill", "freeze")
            anim.setAttribute("dur", "1s")
            anim.setAttribute("repeatCount", "indefinite")
            anim.setAttribute("attributeName", "r")

            svgEl.appendChild(anim);
            anim.beginElement();
            timeout(()=>{anim.parentElement.removeChild(anim);console.log("object");},3000);
          
        }
        if(neighbor !== undefined)
        {
            let svgEl = document.getElementById(neighbor.id);
            var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate")
            anim.setAttribute("begin", "indefinite")
            anim.setAttribute("from", 10)
            anim.setAttribute("to", 50)
            anim.setAttribute("fill", "freeze")
            anim.setAttribute("dur", "1s")
            anim.setAttribute("repeatCount", "indefinite")
            anim.setAttribute("attributeName", "r")

            svgEl.appendChild(anim);
            anim.beginElement();
            setTimeout(function() { anim.parentElement.removeChild(anim); }, 2000);
        
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