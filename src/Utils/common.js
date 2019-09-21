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
    if (!addVertexToGraphs) {
        const vtx1 = document.getElementById(vertex1);
        const vtx2 = document.getElementById(vertex2);
        if (vtx1 && vtx2)
            draw(vtx1, vtx2);
        return;
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
function setNodesStyle(nodes, type, mode) {
    const circles = nodes.getElementsByTagName("circle");
    if (mode === "show") {
        let color;
        if (type === "store") color = "green";
        else if (type === "facility") color = "blue";
        else color = "gray";
        for (let i = 0; i < circles.length; i++) {
            circles[i].setAttribute("style", "cursor: pointer");
            circles[i].setAttribute("stroke", "black");
            circles[i].setAttribute("stroke-width", 0.5);
            circles[i].setAttribute("fill", color);
            circles[i].setAttribute("fill-opacity", 0.7);
        }
    }
    else {
        for (let i = 0; i < circles.length; i++) {
            circles[i].setAttribute("style", "cursor: pointer");
            circles[i].setAttribute("stroke", "none");
            circles[i].setAttribute("stroke-width", 0);
            circles[i].setAttribute("fill", "transparent");
        }
    }
}
const showNodes = (excludePath) => {
    //show nodes
    const nodes = document.querySelectorAll("[id^='node-']");
    nodes.forEach(nodeFloor => {
        const storeNodes = nodeFloor.querySelector("#store_node");
        const facilityNodes = nodeFloor.querySelector("#facility_node");
        const pathNodes = nodeFloor.querySelector("#path_node");
        if (storeNodes && facilityNodes && pathNodes) {
            setNodesStyle(storeNodes, "store", "show");
            setNodesStyle(facilityNodes, "facility", "show");
            setNodesStyle(pathNodes, "path", "show");
            if (excludePath) setNodesStyle(pathNodes, "path", "hide");
        }
    });
    //show YAH nodes
    const YAHNodes = document.querySelectorAll("[id*='YAH']");
    YAHNodes.forEach(YAHnode => {
        YAHnode.setAttributeNS(null, "stroke", "black");
        YAHnode.setAttributeNS(null, "stroke-width", 0.5);
        YAHnode.setAttributeNS(null, "fill", "orange");
        YAHnode.setAttributeNS(null, "fill-opacity", 0.7);
    })
}
const hideNodes = () => {
    const nodes = document.querySelectorAll("[id^='node-']");
    nodes.forEach(nodeFloor => {
        const storeNodes = nodeFloor.querySelector("#store_node");
        const facilityNodes = nodeFloor.querySelector("#facility_node");
        const pathNodes = nodeFloor.querySelector("#path_node");
        if (storeNodes && facilityNodes && pathNodes) {
            setNodesStyle(storeNodes, "store", "hide");
            setNodesStyle(facilityNodes, "facility", "hide");
            setNodesStyle(pathNodes, "path", "hide");
        }
    });
}
const showEdges = () => {
    const edges = document.querySelectorAll("[id^='node-pathline']");
    edges.forEach(edge => {
        const lines = edge.getElementsByTagName("line");
        for (let i = 0; i < lines.length; i++) {
            lines[i].setAttributeNS(null, "stroke", "red");
            lines[i].setAttributeNS(null, "stroke-width", "3");
            lines[i].setAttributeNS(null, "fill", "none");
            lines[i].setAttributeNS(null, "stroke-dasharray", "5,5");
            lines[i].setAttributeNS(null, "style", "cursor: pointer;");
        }
    })
}
const hideEdges = () => {
    const edges = document.querySelectorAll("[id^='node-pathline']");
    edges.forEach(edge => {
        const lines = edge.getElementsByTagName("line");
        for (let i = 0; i < lines.length; i++) {
            lines[i].setAttribute("fill", "transparent");
            lines[i].setAttribute("stroke", "none");
            lines[i].setAttribute("stroke-width", 0);
            lines[i].setAttributeNS(null, "style", "cursor: normal;");
        }
    });
}
const highLightNodeEl = (nodeId, time, flagScrolling) => {
    var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate")
    anim.setAttribute("begin", "indefinite")
    anim.setAttribute("from", 10)
    anim.setAttribute("to", 20)
    anim.setAttribute("fill", "freeze")
    anim.setAttribute("dur", "1s")
    anim.setAttribute("repeatCount", "indefinite")
    anim.setAttribute("attributeName", "r")
    // anim.setAttribute("stroke-width",3)
    if (nodeId !== undefined) {
        // console.log("node");
        let svgEl = document.getElementById(nodeId);
        if (!svgEl) {
            alert(`Not found node on maps`);
            return;
        }
        let svgId = nodeId.substring(0, 2);
        let svgRoot = document.getElementById(`svg-${svgId}`);
        if (flagScrolling)
            svgRoot.scrollIntoView();
        svgEl.setAttribute("stroke-width", 3);
        svgEl.setAttribute("stroke", "red");
        svgEl.appendChild(anim);
        anim.beginElement();
        setTimeout(function () {
            anim.parentElement.removeChild(anim);
            svgEl.setAttribute("stroke-width", 0);
            svgEl.setAttribute("stroke", "none");
        }, time);
    }
}
const removeShortestPathEl = (idVertex1, idVertex2) => {

    const noAnimation_Path = document.querySelectorAll(".noAnimation-path");
    const animated_Path = document.querySelectorAll(".animation-path");
    for (let i = 0; i < noAnimation_Path.length; i++) {
        noAnimation_Path[i].parentElement.removeChild(noAnimation_Path[i]);
    }
    for (let i = 0; i < animated_Path.length; i++) {
        animated_Path[i].parentElement.removeChild(animated_Path[i]);
    }
    let highLightEls = document.getElementsByClassName("highlight-circle");

    for (let i = 0; i < highLightEls.length; i++) {
        highLightEls[i].removeAttribute("class");
        i--;

    }

    // let first_vertex = document.getElementById(idVertex1);
    // first_vertex.removeAttribute("class");
    // let final_vertex = document.getElementById(idVertex2);
    // final_vertex.removeAttribute("class");
    let pin_logo = document.getElementById("pin-logo");
    pin_logo.parentElement.removeChild(pin_logo);

}
export {
    If, drawEdge, handleSaveRelationship,
    deserializeDataToGraphs, hideNodes, showNodes,
    showEdges, hideEdges, removeShortestPathEl,
    highLightNodeEl
}