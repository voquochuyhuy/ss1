import React from 'react'
import { handleSaveRelationship } from '../../Utils';
export default function SaveGraph({ data }) {
    return (
        <button onClick={() => handleSaveRelationship(data, "graphs")}>Save Graphs</button>
    )
}
