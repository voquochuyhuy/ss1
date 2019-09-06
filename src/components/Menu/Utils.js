import React from 'react';
export const VertexFinding = () => {
    return (
        <div>
            <input type="text" id="first-vertex" />
            <span> </span>
            <input type="text" id="second-vertex" />
        </div>
    )
}
export const MenuButton = ({ handleFileSelect, handleSaveGraphs, LoadGraphsFile }) => {
    return (
        <div id="menu-btn">
            <button onClick={handleFileSelect} >Load Map</button>
            <button onClick={handleSaveGraphs}>Save Graphs</button>
            <button onClick={LoadGraphsFile}>Load Graphs File</button>
        </div>
    )
}
export const MenuRadioButton = ({ onFeature }) => {
    return (
        <div id="menu-radio-btn">
            <input type="radio" id="draw" onChange={() => onFeature("draw")} name="chooseFeature" />Draw Relationship <br />
            <input type="radio" id="delete" onChange={() => onFeature("delete")} name="chooseFeature" />Delete Egde <br />
            <input type="radio" id="way-Finding" onChange={() => onFeature("way-findings")} name="chooseFeature" />Way Finding <br />
        </div>
    )
}