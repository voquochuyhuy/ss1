import React from 'react'
import { handleSaveRelationship } from  "../../utils";
export default function SaveGraph({ data }) {
    return (
        <>
        <button onClick={() => handleSaveRelationship(data, "graphs")}>Save Graphs</button><br/>
        </>
    )
}
