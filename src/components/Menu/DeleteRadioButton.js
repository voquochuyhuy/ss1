import React from 'react'

export default function DeleteRadioButton (props) {
    const OnDeleteEgde = ()=>{
        props.OnDeleteEgde()
    }
        return (
            <>
                <input type="radio" id="delete" onChange={() => {OnDeleteEgde()}} name="chooseFeature"/>DELETE <br />
            </>
        )
    
}
