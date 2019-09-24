import React from 'react';
import { Cell } from './Cell';
import CellEditable from './CellEditable';
import matchSorter from 'match-sorter';
const styles = {
    backgroundColor: '#dadada',
    // borderRadius: '2px',
    marginTop : 5,
    marginBottom : 1
}
const Node = {
    Header: 'Node',
    id: 'node-root',
    accessor: d => d.node.id,
    Cell: props => <Cell key={'node-' + props.original.node.id} node={props.original.node} property='id' />,
    filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["node-root"] }),
    filterAll: true
};
const Type = {
    Header: 'Type',
    accessor: 'node.type',
    id: 'node-type',
    width: 150,
    Cell: props => <Cell key={'node-type' + props.original.node.id} node={props.original.node} property='type' />,
    filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["node-type"] }),
    filterAll: true
};
const Neighbors = (data, onChangeData) => {
    return {
        id: 'neighbors',
        Header: 'Neighbors',
        accessor: d => d.neighbors.map(neighbor => neighbor.id),
        Cell: props => {
            const { node, neighbors } = props.original;
            return neighbors.map(neighbor => {
                return <CellEditable key={'neighbor-' + neighbor.id} data={data} node={node} neighbor={neighbor} propertyToEdit='id' onChangeData={onChangeData} />
            })
            
        },
        filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["neighbors"] }),
        filterAll: true
    }
};
const NeighborsType = (data, onChangeData) => {
    return {
        Header: props => <span>Type</span>,
        id: 'nb-type',
        accessor: d => d.neighbors.map(neighbor => neighbor.type),
        Cell: props => {
            const { node, neighbors } = props.original;
            return neighbors.map(neighbor => {
                return <CellEditable key={`neighbor-type-${neighbor.id}`} data={data} node={node} neighbor={neighbor} propertyToEdit='type' onChangeData={onChangeData} />
            })
        },
        filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["nb-type"] }),
        filterAll: true,
        width: 150,
    }
};
const Cost = (data, onChangeData) => {
    return {
        id: 'cost',
        Header: 'Cost',
        width: 100,
        accessor: d => d.neighbors.map(neighbor => neighbor.cost),
        Cell: props => {
            const { node, neighbors } = props.original;
            return neighbors.map(neighbor => {
                return <CellEditable key={'cost-' + neighbor.id} data={data} node={node} neighbor={neighbor} propertyToEdit='cost' onChangeData={onChangeData} />
            })
        },
        filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["cost"] }),
        filterAll: true,
    }
};
const Action = (handleRemoveNeighbor) => {
    return {
        Header: 'Action',
        id: 'action',
        Cell: props => {
            const { node, neighbors } = props.original;
            return neighbors.map(neighbor => {
                return <div  key={neighbor.id}>
                    <button style={styles} onClick={() => handleRemoveNeighbor(node, neighbor)}>Remove</button>
                </div>
            })
        },
        filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["action"] }),
        filterAll: true,
        width: 150
    }
}
const COLUMNS = { Node, Type, Neighbors, NeighborsType, Cost, Action }
export default COLUMNS;