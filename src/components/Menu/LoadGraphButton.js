import React from 'react'

export default function LoadGraph (props) {
    const  LoadGraphsFile = async () => {
        const el = await document.createElement("div");
        el.innerHTML = "<input type='file'/>";
        const fileInput = await el.firstChild;
        await fileInput.click();
        await fileInput.addEventListener("change", e => {
            if (fileInput.files[0].name.match(/\.(txt|json)$/)) {
                props.onFileGraphsChange(e);
            } else {
                alert(`File not supported, .txt or .json files only`);
            }
        });
    }
        return (          
            <button onClick={LoadGraphsFile}>Load Graphs File</button>       
        )
  
}