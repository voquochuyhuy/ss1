import React from 'react'
import { If } from "../../Utils";
const VertextureComponent = () => {
    return (
        <div>
            <input type="text" id="first-vertex" />
            <span> </span>
            <input type="text" id="second-vertex" />
        </div>)
}
export default function WayFindRadioButton(props) {
    
    const OnWayFinding = () => {
        props.OnWayFinding();

    };
    const condition = props.feature === 'find';
    return (
        <>
            <input type="radio" id="way-Finding" onChange={() => { OnWayFinding() }} name="chooseFeature" />Way Finding <br />
            <If condition={condition} component={VertextureComponent} />
        </>
    )
}
