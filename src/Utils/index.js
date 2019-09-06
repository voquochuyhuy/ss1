import React from 'react';
export const If = ({ component: Component, condition, propsForComponent }) => {
    if (!propsForComponent)
        return condition ? <Component /> : null;
    return condition ? <Component {...propsForComponent} /> : null;
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
 * @description lưu graphs hoặc data xuống file JSON, nếu là data, deserialize trước khi lưu.
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