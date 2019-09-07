import React from 'react';
import _ from "lodash";
export const If = ({ component: Component, condition, propsForComponent }) => {
    if (!propsForComponent)
        return condition ? <Component /> : null;
    return condition ? <Component {...props} /> : null;
}
/**
 * 
 * @param {Array} data data có cấu trúc như data của RelationshipTable
 * @returns {{}} Object graphs
 * @description chuẩn hóa data sang graphs cho input của lib node-dijkstra
 */
export const deserializeDataToGraphs = (data) => {
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
export const handleSaveRelationship = (data, type) => {
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
export const drawEdge = (vertex1, vertex2, floorId) => {
    // if (this.state.feature === "draw") {
    //check vertex1 and vertex2 là 1 HMTLElement hay 1 string
    //Nếu là string (id của 1 Element) thì vẽ dựa vào graphs có sẵn, k thì tạo graphs mới
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
 export const addVertexToGraphs=(vertex1, vertex2) =>{
    const { graphs } = this.state;
    const x1 = vertex1.getAttributeNS(null, "cx");
    const y1 = vertex1.getAttributeNS(null, "cy");
    const x2 = vertex2.getAttributeNS(null, "cx");
    const y2 = vertex2.getAttributeNS(null, "cy");
    const deltaX = Math.abs(parseInt(x2) - parseInt(x1));
    const deltaY = Math.abs(parseInt(y2) - parseInt(y1));
    const cost = Math.round(
        Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
    );
    const idVertex1 = vertex1.id;
    const idVertex2 = vertex2.id;
    let edgeExisted = false;
    //check idVertex1 is existed in graphs
    if (graphs[idVertex1]) {
        if (graphs[idVertex2] && graphs[idVertex2][idVertex1]) {
            console.log("ton tai v1, v2 va v1 co v2 => trung nhau");
            edgeExisted = true;
            return edgeExisted;
        } else if (graphs[idVertex2] && !graphs[idVertex2][idVertex1]) {
            console.log("ton tai v1, v2 nhung v1 chua co v2");
            graphs[idVertex2] = { ...graphs[idVertex2], [idVertex1]: cost };
            graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
            this.setState({ graphs });
        } else if (!graphs[idVertex2]) {
            console.log("ton tai v1 va ko ton tai v2");
            graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
            const graph = {
                [idVertex2]: {
                    [idVertex1]: cost
                }
            };
            this.setState({ graphs: { ...graphs, ...graph } });
        } else {
            graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
            const graph = {
                [idVertex2]: {
                    [idVertex1]: cost
                },
                [idVertex1]: {
                    [idVertex2]: cost
                }
            };
            this.setState({ graphs: { ...graphs, ...graph } });
        }
        return edgeExisted;
    } else {
        //v1 chua co nhung v2 da co
        console.log("v1 chua co nhung v2 da co ");
        if (graphs[idVertex2]) {
            graphs[idVertex2] = { ...graphs[idVertex2], [idVertex1]: cost };
            //them v1 vao graphs
            const graph = {
                [idVertex1]: {
                    [idVertex2]: cost
                }
            };
            this.setState({ graphs: { ...graphs, ...graph } });
        } else {
            //ca 2 cung chua co
            console.log("ca 2 cung chua co");
            const graph = {
                [idVertex1]: {
                    [idVertex2]: cost
                },
                [idVertex2]: {
                    [idVertex1]: cost
                }
            };
            this.setState({ graphs: { ...graphs, ...graph } });
        }
    }
    return edgeExisted;
}
const DeleteEgde = (edge, vertex1Id, vertex2Id) => {
    const removeVertexFromGraphs = (v1, v2) => {
        const { graphs } = this.state;
        if (_.has(graphs, [v1, v2]) && _.has(graphs, [v2, v1])) {
            delete graphs[v1][v2];
            delete graphs[v2][v1];
            this.setState({ graphs });
        }
    }
    if (this.state.feature === "delete" && typeof edge !== "string") {
        edge.parentElement.removeChild(edge);
    }
    else if (typeof edge === "string") {
        const edgeId = edge;
        let edgeEl = document.getElementById(edgeId);
        if (!edgeEl) {
            const tryEdgeId = edgeId.split(':').reverse().join(':');
            edgeEl = document.getElementById(tryEdgeId);
        }
        edgeEl.parentElement.removeChild(edgeEl);
    }
    removeVertexFromGraphs(vertex1Id, vertex2Id);
};