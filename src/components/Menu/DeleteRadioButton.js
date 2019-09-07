import React from 'react'

export default function DeleteRadioButton (props) {
    const OnDeleteEgde = ()=>{
        props.OnDeleteEgde()
    }
        return (
            <div>
                <input type="radio" id="delete" onChange={() => {OnDeleteEgde()}} name="chooseFeature"/>DELETE <br />
            </div>
        )
    
}
