
/**@param node : id of node element
 * @return type of node
 */
function getTypeOfNode(node) {
    const doc = document.getElementById(node);
    if (!doc) return null;
    const parentElement = doc.parentElement;
    let type = '';
    if (parentElement.id.includes('store'))
        type = 'store';
    else if (parentElement.id.includes('facility'))
        type = 'facility';
    else type = 'path';
    return type;
}
function getNameOfNode(node) {
    const doc = document.getElementById(node); //node = L4_29_NODE
    if (!doc) return null;
    const docTitle = document.getElementById('storetitle');
    if (!docTitle) return node;
    const storeTitle = docTitle.children;
    const nodeId = doc.id.split('_NODE')[0];//nodeis = L4_29
    if (nodeId.includes('YAH') || nodeId === 'youarehere')
        return nodeId;
    for (let i = 0; i < storeTitle.length; i++) {
        if (storeTitle[i].id.includes('_CODE') && storeTitle[i].id.includes(nodeId.split('_')[1])) { //includes '29'
            return storeTitle[i].firstChild.textContent;
        }
    }
}
function transformNeighborsOfNode(object) {
    return Object.keys(object).map(node => {
        const type = getTypeOfNode(node);
        const neighbor = {
            id: node,
            name: type === 'path' || type === 'facility' ? node : getNameOfNode(node),
            type: type,
            cost: object[node]
        }
        return neighbor;
    })
}
const serializeGraphsToData = (graphs) => {
    const graphsArray = Object.keys(graphs).map(node => {
        const type = getTypeOfNode(node);
        const neighbors = transformNeighborsOfNode(graphs[node]);
        const relation = {
            node: {
                id: node,
                type: type,
                name: type === 'path' || type === 'facility' ? node : getNameOfNode(node)
            },
            neighbors: neighbors
        }
        return relation;
    });
    return graphsArray;
}
export { serializeGraphsToData }