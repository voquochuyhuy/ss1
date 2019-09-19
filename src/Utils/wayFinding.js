import _ from 'lodash';
import { roundPathCorners } from '../Utils';
const Graph = require('node-dijkstra');
/**
 * @param {string} vertex1 vertex1 HTMLElement id
 * @param {string} vertex2 vertex2 HTMLElement id
 * @param {Graph} route route for Graph
 * @param {Boolean} tryFindFlag nếu true, cố gắng tìm lại route khác 
 * @returns path : Array of path
 */
function findShortestPath(vertex1, vertex2, route, tryFindFlag) {
    if (!route) return null;
    if (tryFindFlag) {
        const tempRoute = _.cloneDeep(route);
        const keysArray = [...tempRoute.graph.keys()];
        const floor = vertex1.substring(0, 2);
        //nếu 2 node trong cùng 1 floor nhưng routing đến node ở floor khác (do graph) 
        //thì xóa các node ở floor khác & routing lại
        const removed = _.remove(keysArray, key => key.substring(0, 2) !== floor);
        removed.forEach(key => {
            tempRoute.removeNode(key);
        })
        return tempRoute.path(vertex1, vertex2);
    }
    return route.path(vertex1, vertex2);
};

/**
 * 
 * @param {string} vertex1 
 * @param {string} vertex2 
 * @param {any} route 
 * @return pathArr
 */
function drawShortestPath(vertex1, vertex2, route) {
    let pathArr = findShortestPath(vertex1, vertex2, route);
    let step = _.groupBy(pathArr, (vertexId) => {
        return vertexId.substring(0, 2);
    });
    if (vertex1.substring(0, 2) === vertex2.substring(0, 2) && _.size(step) > 1) {
        pathArr = findShortestPath(vertex1, vertex2, route, true);
        step = _.groupBy(pathArr, (vertexId) => {
            return vertexId.substring(0, 2);
        });
    }
    if (!pathArr) {
        alert("Not found shortest path, check model graphs");
        return;
    }
    let first_vertex = document.getElementById(pathArr[0]);
    first_vertex.setAttributeNS(null, "class", "highlight-circle");
    let final_vertex = document.getElementById(pathArr[pathArr.length - 1]);
    final_vertex.setAttributeNS(null, "class", "highlight-circle");
    const pinLogo = document.createElementNS("http://www.w3.org/2000/svg", "image")
    pinLogo.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "./pin-logo.png");
    pinLogo.setAttributeNS(null, "x", `${final_vertex.attributes.cx.value - 15}`);
    pinLogo.setAttributeNS(null, "y", `${final_vertex.attributes.cy.value - 30}`);
    pinLogo.setAttributeNS(null, "width", `30`);
    pinLogo.setAttributeNS(null, "height", `30`);
    pinLogo.setAttributeNS(null, "id", "pin-logo");
    pinLogo.setAttributeNS(null, "background", "transparent");
    const draw = (X, Y, SVGnodes) => {
        var NoAnimatedPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        let M = `M ${X[0]} ${Y[0]}`;
        for (let i = 1; i < X.length; i++) {
            M += `L ${X[i]} ${Y[i]} `;
        }
        const roudingPath = roundPathCorners(M, 0.5, true);
        NoAnimatedPath.setAttributeNS(null, "d", `${roudingPath}`);
        NoAnimatedPath.setAttributeNS(null, "stroke", "rgb(247, 199, 0)");
        NoAnimatedPath.setAttributeNS(null, "stroke-width", "3");
        NoAnimatedPath.setAttributeNS(null, "fill", "transparent");
        NoAnimatedPath.setAttributeNS(null, "stroke-dasharray", "10");
        NoAnimatedPath.setAttributeNS(null, "class", "noAnimation-path");
        SVGnodes.appendChild(NoAnimatedPath);

        var animatedPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        animatedPath.setAttributeNS(null, "d", `${roudingPath}`);
        animatedPath.setAttributeNS(null, "class", "animation-path");//
        animatedPath.setAttributeNS(null, "stroke-width", "3");
        animatedPath.setAttributeNS(null, "fill", "transparent");
        animatedPath.setAttributeNS(null, "stroke-linejoin", "round");
        SVGnodes.appendChild(animatedPath);
        SVGnodes.appendChild(pinLogo);
    }
    if (_.size(step) !== 1) {
        _.forEach(step, (verticesGroup) => {
            let floor_id = verticesGroup[0].substring(0, 2);
            let X = [];
            let Y = [];
            for (let i = 0; i < verticesGroup.length; i++) {
                const vtx = verticesGroup[i];

                X.push(document.getElementById(vtx).attributes.cx.value);
                Y.push(document.getElementById(vtx).attributes.cy.value);
            };
            let SVGnodes = document.getElementById(`node-pathline-${floor_id}`);
            draw(X, Y, SVGnodes);
        });
    }
    else {
        const verticesGroup = _.reduce(step, (firstGroup) => firstGroup);
        let floor_id = verticesGroup[0].substring(0, 2);
        let X = [];
        let Y = [];
        for (let i = 0; i < verticesGroup.length; i++) {
            const vtx = verticesGroup[i];
            X.push(document.getElementById(vtx).attributes.cx.value);
            Y.push(document.getElementById(vtx).attributes.cy.value);

        }
        let SVGnodes = document.getElementById(`node-pathline-${floor_id}`);
        draw(X, Y, SVGnodes);
    }
    return pathArr;
};
export { drawShortestPath }