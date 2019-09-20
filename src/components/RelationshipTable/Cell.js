import React from 'react';
import { highLightNodeEl } from '../../Utils';
// import {attr,animate} from "svg.js";
export const Cell = ({ node, neighbor, property, propertyToEdit, canEdit, onBlur }) => {
    if (typeof canEdit !== "boolean") canEdit = false;
    return (
        <div
            key={`${neighbor}-${property}`}
            style={{ backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' }}
            contentEditable={canEdit}
            suppressContentEditableWarning={canEdit}
            onBlur={e => canEdit ? onBlur(e) : null}
            dangerouslySetInnerHTML={{
                __html: canEdit ? neighbor[propertyToEdit] : node[property]
            }}
            onClick={(e) => {
                if (e.target.innerHTML.includes("_")) {
                    highLightNodeEl(e.target.innerHTML);
                }
            }}
        />
    )
}