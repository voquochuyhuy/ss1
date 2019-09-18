import _ from 'lodash';

/**
 * @param {HTMLElement} vertex1 đỉnh thứ nhất 
 * @param {HTMLElement} vertex2 đỉnh thứ hai 
 * @param {{}} graphs graphs input cho node-dijkstra
 * @param {function} onChangeGraphs function thay đổi state cho hàm gọi
 * @returns edgeExisted : cạnh đã tồn tại giữa 2 đỉnh chưa?
 */
function addVertexToGraphs(vertex1, vertex2, graphs, onChangeGraphs) {
    const x1 = vertex1.getAttributeNS(null, "cx");
    const y1 = vertex1.getAttributeNS(null, "cy");
    const x2 = vertex2.getAttributeNS(null, "cx");
    const y2 = vertex2.getAttributeNS(null, "cy");
    const deltaX = Math.abs(parseInt(x2) - parseInt(x1));
    const deltaY = Math.abs(parseInt(y2) - parseInt(y1));
    const cost = Math.round(Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)));
    const idVertex1 = vertex1.id;
    const idVertex2 = vertex2.id;
    let edgeExisted = false;
    //check idVertex1 is existed in graphs
    if (graphs[idVertex1]) {
        if (graphs[idVertex2] && graphs[idVertex2][idVertex1]) {
            // console.log("ton tai v1, v2 va v1 co v2 => trung nhau");
            edgeExisted = true;
            return edgeExisted;
        } else if (graphs[idVertex2] && !graphs[idVertex2][idVertex1]) {
            // console.log("ton tai v1, v2 nhung v1 chua co v2");
            graphs[idVertex2] = { ...graphs[idVertex2], [idVertex1]: cost };
            graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
            // this.setState({ graphs });//
            onChangeGraphs({ ...graphs });
        } else if (!graphs[idVertex2]) {
            // console.log("ton tai v1 va ko ton tai v2");
            graphs[idVertex1] = { ...graphs[idVertex1], [idVertex2]: cost };
            const graph = {
                [idVertex2]: {
                    [idVertex1]: cost
                }
            };
            // this.setState({ graphs: { ...graphs, ...graph } });//
            onChangeGraphs({ ...graphs, ...graph });
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
            onChangeGraphs({ ...graphs, ...graph });
            // this.setState({ graphs: { ...graphs, ...graph } });
        }
        return edgeExisted;
    } else {
        //v1 chua co nhung v2 da co
        // console.log("v1 chua co nhung v2 da co ");
        if (graphs[idVertex2]) {
            graphs[idVertex2] = { ...graphs[idVertex2], [idVertex1]: cost };
            //them v1 vao graphs
            const graph = {
                [idVertex1]: {
                    [idVertex2]: cost
                }
            };
            // this.setState({ graphs: { ...graphs, ...graph } });
            onChangeGraphs({ ...graphs, ...graph });
        } else {
            //ca 2 cung chua co
            // console.log("ca 2 cung chua co");
            const graph = {
                [idVertex1]: {
                    [idVertex2]: cost
                },
                [idVertex2]: {
                    [idVertex1]: cost
                }
            };
            // this.setState({ graphs: { ...graphs, ...graph } });//
            onChangeGraphs({ ...graphs, ...graph });
        }
    }
    return edgeExisted;
}
/**
 * 
 * @param {string} v1 đỉnh thứ nhất
 * @param {string} v2 đỉnh thứ hai
 * @param {{}} graphs graphs input cho node-dijkstra
 * @param {function} onChangeGraphs function thay đổi state cho hàm gọi
 */
function removeVertexFromGraphs(v1, v2, graphs, onChangeGraphs) {
    if (_.has(graphs, [v1, v2]) && _.has(graphs, [v2, v1])) {
        delete graphs[v1][v2];
        delete graphs[v2][v1];
        if (_.isEmpty(graphs[v1])) {
            delete graphs[v1];
        }
        if (_.isEmpty(graphs[v2])) {
            delete graphs[v2];
        }
        onChangeGraphs(graphs);
    }
}
/**
 * 
 * @param {{}} graphs object graphs
 * @param {string} v1 vertex1 HTMLElement id 
 * @param {string} v2 vertex2 HTMLElement id
 */
function checkEdgesExist(graphs, v1, v2) {
    if (graphs[v1] && graphs[v2] && (graphs[v1][v2] || graphs[v2][v1])) {
        return true;
    }
    return false;
}
export { addVertexToGraphs, removeVertexFromGraphs, checkEdgesExist }