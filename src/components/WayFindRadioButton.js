import React, { Component } from 'react'

export default function WayFindRadioButton (props) {
    const OnWayFinding = () => {
        props.OnWayFinding();
        for (let i = 0; i < props.listIDOfMap.length; i++) {
            let floorId = props.listIDOfMap[i];
            let groupPathNode = document.getElementById(`node-pathline-${floorId}`);
            let clone = groupPathNode.cloneNode(false);
            groupPathNode.replaceWith(clone);
            let pathNodes = document.getElementsByTagName("circle");
            for (let y = 0; y < pathNodes.length; y++) {
                if (pathNodes[y].id.startsWith(`${floorId}_PATH`)) {
                    pathNodes[y].setAttributeNS(null, "fill", "transparent");
                    pathNodes[y].setAttributeNS(null, "stroke", "transparent");
                }
            }
        }
    };
        return (
            <div>
            <input type="radio" id="way-Finding" onChange={() => {OnWayFinding()}} name="chooseFeature"/>Way Finding <br />
            {
                props.feature === 'find' ? (
                <div>
                    <input type="text" id="first-vertex" />
                    <span> </span>
                    <input type="text" id="second-vertex" />
                </div>) : null
            }
            </div>
           
        )
    
}
