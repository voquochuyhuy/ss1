import React from 'react';
// import _ from "lodash";
const If = ({ component: Component, condition, props }) => {
    if (!props)
        return condition ? <Component /> : null;
    return condition ? <Component {...props} /> : null;
}
/**
 * 
 * @param {Array} data data có cấu trúc như data của RelationshipTable
 * @returns {{}} Object graphs
 * @description chuẩn hóa data sang graphs cho input của lib node-dijkstra
 */
const deserializeDataToGraphs = (data) => {
    let graphs = {};
    data.forEach(items => {
        const arrayNeighbor = items.neighbors.map(neighbor => {
            return [[neighbor.id], neighbor.cost]
        });
        const nb = arrayNeighbor.reduce((prev, curr) => { prev[curr[0]] = curr[1]; return prev; }, {})
        const item = {
            [items.node.id]: {
                ...nb
            }
        };
        graphs = { ...graphs, ...item }
    });
    // console.log('result save : ', graphs);
    return graphs;
}
/**
 * 
 * @param {Array} data : graphs hoặc data có cấu trúc như data của RelationshipTable
 * @param {String} type :  "graphs"/"data"
 * @description lưu graphs hoặc data xuống file JSON, nếu là data, deserialize thành graphs trước khi lưu.
 */
const handleSaveRelationship = (data, type) => {
    let newData = data;
    if (type !== "graphs")
        newData = deserializeDataToGraphs(data);
    const a = document.createElement("a");
    document.body.appendChild(a);
    const fileName = "graphs.json";
    const json = JSON.stringify(newData);
    const blob = new Blob([json], { type: "octet/stream" });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};
/**
 * 
 * @param {HTMLElement} vertex1 
 * @param {HTMLElement} vertex2 
 * @param {String} floorId 
 * @param {function} DeleteEgde
 * @param {function} addVertexToGraphs
 */
const drawEdge = (vertex1, vertex2, floorId, DeleteEgde, addVertexToGraphs) => {
    const node_path = document.getElementById(`node-pathline-${floorId}`);
    const draw = (v1, v2) => {
        const x1 = v1.getAttributeNS(null, "cx");
        const y1 = v1.getAttributeNS(null, "cy");
        const x2 = v2.getAttributeNS(null, "cx");
        const y2 = v2.getAttributeNS(null, "cy");
        let edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
        edge.setAttributeNS(null, "id", `${v1.id}:${v2.id}`);
        edge.setAttributeNS(null, "x1", x1);
        edge.setAttributeNS(null, "y1", y1);
        edge.setAttributeNS(null, "x2", x2);
        edge.setAttributeNS(null, "y2", y2);
        edge.setAttributeNS(null, "stroke", "red");
        edge.setAttributeNS(null, "stroke-width", "3");
        edge.setAttributeNS(null, "fill", "none");
        edge.setAttributeNS(null, "stroke-dasharray", "5,5");
        edge.setAttributeNS(null, "style", "cursor: pointer;");
        edge.addEventListener("click", () => {
            DeleteEgde(edge, v1.id, v2.id);
        });
        node_path.appendChild(edge);
    }
    if (typeof vertex1 !== "string") {
        const edgeExisted = addVertexToGraphs(vertex1, vertex2);
        edgeExisted ? alert('edge already existed') : draw(vertex1, vertex2);
    }
    else {
        const vtx1 = document.getElementById(vertex1);
        const vtx2 = document.getElementById(vertex2);
        if (vtx1 && vtx2)
            draw(vtx1, vtx2);
    }
}
export { If, drawEdge, handleSaveRelationship, deserializeDataToGraphs }