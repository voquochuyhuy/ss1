import _ from 'lodash';
function findShortestPath(vertex1, vertex2, route) {
    if (!route) return null;
    const path = route.path(vertex1, vertex2);
    return path;
};

/**
 * 
 * @param {string} vertex1 
 * @param {string} vertex2 
 * @param {any} route 
 */
function drawShortestPath(vertex1, vertex2, route) {
    const pathArr = findShortestPath(vertex1, vertex2, route);
    if (!pathArr) {
        alert("Not found shortest path, check model graphs");
        return;
    }
    const step = _.groupBy(pathArr, (vertexId) => {
        return vertexId.substring(0, 2);
    });
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
        NoAnimatedPath.setAttributeNS(null, "d", `${M}`);
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
        animatedPath.setAttributeNS(null, "d", `${M}`);
        animatedPath.setAttributeNS(null, "class", "animation-path");//
        animatedPath.setAttributeNS(null, "stroke-width", "3");
        animatedPath.setAttributeNS(null, "fill", "transparent");
        SVGnodes.appendChild(animatedPath);
        SVGnodes.appendChild(pinLogo);
    }

    console.log(step, _.size(step));
    if (_.size(step) !== 1) {
        _.forEach(step, (verticesGroup) => {
            // console.log('verticesGroup : ', verticesGroup);
            let floor_id = verticesGroup[0].substring(0, 2);
            let X = [];
            let Y = [];
            for (let i = 0; i < verticesGroup.length; i++) {
                const vtx = verticesGroup[i];

                X.push(document.getElementById(vtx).attributes.cx.value);
                Y.push(document.getElementById(vtx).attributes.cy.value);
            };
            let SVGnodes = document.getElementById(floor_id).lastChild;
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
        console.log(floor_id);
        let SVGnodes = document.getElementById(`node-${floor_id}`);
        console.log(SVGnodes);
        draw(X, Y, SVGnodes);
    }
};

export { drawShortestPath }