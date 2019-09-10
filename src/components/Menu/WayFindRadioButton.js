import React from 'react'
import { If } from '../../Utils';
const VertextureComponent = () => {
    return (
        <div>
            <input type="text" id="first-vertex" />
            <span> </span>
            <input type="text" id="second-vertex" />
        </div>)
}
export default function WayFindRadioButton(props) {
    /*ĐỔI feature (state của component cha và transparent các node-path) */
    const OnWayFinding = () => {
        props.OnWayFinding();
        for (let i = 0; i < props.listIdOfMap.length; i++) {
            let floorId = props.listIdOfMap[i];
            let groupPathNode = document.getElementById(`node-pathline-${floorId}`);
            let clone = groupPathNode.cloneNode(false);
            groupPathNode.replaceWith(clone);
            let pathNodes = document.getElementsByTagName("circle");
            for (let y = 0; y < pathNodes.length; y++) {
                if (pathNodes[y].id.startsWith(`${floorId}_PATH`)) {
                    pathNodes[y].setAttributeNS(null, "fill", "transparent");
                    pathNodes[y].setAttributeNS(null, "stroke", "transparent");
                }
            }
        }
    };
    const condition = props.feature === 'find';
    return (
        <>
            <input type="radio" id="way-Finding" onChange={() => { OnWayFinding() }} name="chooseFeature" />Way Finding <br />
            <If condition={condition} component={VertextureComponent} />
        </>
    )
}
