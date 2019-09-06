import React, { Component } from 'react'
import _ from "lodash";
export default function DrawRadioButton(props) {
    const OnDrawingEgde=()=>{
        props.OnDrawingEgde();
        const pathNodes = document.getElementsByTagName("circle");
        for (let i = 0; i < pathNodes.length; i++) {
            if (pathNodes[i].id.includes("PATH")) {
                pathNodes[i].setAttributeNS(null, "fill", "rgb(101, 95, 84)");
                pathNodes[i].setAttributeNS(null, "stroke", "rgb(230, 231, 232)");
            }
        }
        if (document.getElementsByClassName("animation-path").length !== 0) {
            let noAnimation_Path = document.getElementsByClassName("noAnimation-path");
            for (let i = 0; i < noAnimation_Path.length; i++) {
                noAnimation_Path[i].parentElement.removeChild(noAnimation_Path[i]);
            }
            let animated_Path = document.getElementsByClassName("animation-path");
            for (let i = 0; i < animated_Path.length; i++) {
                animated_Path[i].parentElement.removeChild(animated_Path[i]);
            }
            let first_vertex = document.getElementById(this.state.vertex1);
            first_vertex.removeAttribute("class");
            let final_vertex = document.getElementById(this.state.vertex2);
            final_vertex.removeAttribute("class");
            let pin_logo = document.getElementById("pin-logo");
            pin_logo.parentElement.removeChild(pin_logo);
        }
    }
    const drawEdgeFromGraphs = ()=>{
        const loadedGraphs = props.graphs;
        console.log('drawEdgeFromGraphs called');
        const array = [];
        Object.keys(loadedGraphs).forEach(nodeId => {
            Object.keys(loadedGraphs[nodeId]).forEach(nodeNeighborId => {
                // this.drawEdge(node, nodeNeighbor, '0');
                if (_.findIndex(array, { 'node': nodeNeighborId, 'neighbor': nodeId }) === -1) {
                    array.push({ 'node': nodeId, 'neighbor': nodeNeighborId });
                }
            });
        });
        array.forEach(item => {
            //hard code 0 nên k thể vẽ trên nhiều bảng
            // dựa vào item.node và item.neight mà vẽ
            if (item.node.substring(0, 2) === item.neighbor.substring(0, 2))
                props.drawEdge(item.node, item.neighbor, item.node.substring(0, 2));
        })
    }
        return (
            <div>
                 <input type="radio" id="draw" onChange={() => {drawEdgeFromGraphs(); OnDrawingEgde();}}name="chooseFeature"/>DRAW <br />
            </div>
        )
    
}
