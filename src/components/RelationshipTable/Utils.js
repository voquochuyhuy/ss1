/**@param node : id of node element
 * @return type of node
 */
export const getTypeOfNode = (node) => {
    const doc = document.getElementById(node);
    const parentElement = doc.parentElement;
    let type = '';
    if (parentElement.id.includes('store'))
        type = 'store';
    else if (parentElement.id.includes('facility'))
        type = 'facility';
    else type = 'path';
    return type;
}
export const getNameOfNode = (node) => {
    const doc = document.getElementById(node); //node = L4_29_NODE
    const docTitle = document.getElementById('storetitle');
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
export const transformNeighborsOfNode = (object) => {
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