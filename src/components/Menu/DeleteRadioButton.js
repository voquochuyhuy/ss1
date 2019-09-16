import React from 'react'
import { drawEdge } from '../../Utils';
import _ from 'lodash';
export default function DeleteRadioButton(props) {
    const OnDeleteEgde = () => {
        props.OnDeleteEgde()
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
                drawEdge(item.node, item.neighbor, item.node.substring(0, 2), props.DeleteEgde);
        })
    }
    return (
        <>
            <input type="radio" id="delete" onChange={() => { drawEdgeFromGraphs(); OnDeleteEgde() }} name="chooseFeature" />DELETE <br />
        </>
    )

}
