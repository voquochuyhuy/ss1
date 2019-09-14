import React from 'react'
import _ from "lodash";
import { drawEdge } from "../../Utils";
export default function DrawRadioButton(props) {
    const OnDrawingEgde = () => {
        props.OnDrawingEgde();
    }
    const drawEdgeFromGraphs = () => {
        const loadedGraphs = props.graphs;
        const array = [];
        Object.keys(loadedGraphs).forEach(nodeId => {
            Object.keys(loadedGraphs[nodeId]).forEach(nodeNeighborId => {
                if (_.findIndex(array, { 'node': nodeNeighborId, 'neighbor': nodeId }) === -1) {
                    array.push({ 'node': nodeId, 'neighbor': nodeNeighborId });
                }
            });
        });
        array.forEach(item => {
            if (item.node.substring(0, 2) === item.neighbor.substring(0, 2))
                drawEdge(item.node, item.neighbor, item.node.substring(0, 2), props.DeleteEgde, props.addVertexToGraphs);
        })
    }

    return (
        <>
            <input type="radio" id="draw" onChange={() => { drawEdgeFromGraphs(); OnDrawingEgde(); }} name="chooseFeature" />DRAW <br />
        </>
    )

}
