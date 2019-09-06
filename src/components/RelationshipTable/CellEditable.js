import React, { Component } from 'react';
import { If } from '../../Utils';
import { Cell } from './Cell';
// const styles = { backgroundColor: "#fafafa", margin: 5, borderRadius: '2px' };

const CellEdit = ({ data, neighbor, propertyToEdit, onChangeData }) => {
    // const { neighbor, propertyToEdit } = props;
    const onBlur = (e) => {
        // const { data } = this.state;
        if (neighbor[`${propertyToEdit}`] !== e.target.innerHTML) {
            if (propertyToEdit === 'cost')
                neighbor[`${propertyToEdit}`] = Number(e.target.innerHTML);
            else neighbor[`${propertyToEdit}`] = e.target.innerHTML;
            // this.setState({ data });
            onChangeData(data);
        }
    }
    return <Cell
        neighbor={neighbor}
        propertyToEdit={propertyToEdit}
        canEdit={true}
        onBlur={onBlur}
    />
}
class CellEditable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
        this.handleButtonAdd = this.handleButtonAdd.bind(this);
    }
    handleButtonAdd(data, node, onChangeData) {
        let { count } = this.state;
        this.setState({ count: count++ });
        // const { data } = this.state;
        data.forEach(item => {
            if (item.node === node) {
                const newNeighbor = {
                    id: 'new-neighbor-' + count,
                    name: 'new Neighbor ' + count,
                    type: 'path',
                    cost: 1
                }
                item.neighbors.push(newNeighbor);;
            }
        });
        onChangeData(data);
    }
    ButtonAddRelations = ({ data, node, onChangeData }) => {
        return (<button style={{ float: 'right' }} onClick={() => this.handleButtonAdd(data, node, onChangeData)} >+</button>)
    }
    render() {
        console.log(this.props);
        const { data, node, neighbor, propertyToEdit, onChangeData } = this.props;
        return (
            <div>
                <If
                    condition={propertyToEdit === "id"}
                    component={this.ButtonAddRelations}
                    propsForComponent={{ data: data, onChangeData: onChangeData, node: node }}
                />
                <CellEdit data={data} node={node} neighbor={neighbor} propertyToEdit={propertyToEdit} onChangeData={onChangeData} />
            </div>
        )
    }
}
export default CellEditable;