import React from 'react';
export const Cell = ({ node, neighbor, property, propertyToEdit, canEdit, onBlur }) => {
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
        />
    )
}