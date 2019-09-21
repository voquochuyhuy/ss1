import React from 'react'

export default function LoadGraph(props) {
    const handleLoadGraphsClick = async () => {
        const fileInput = await renderGraphsLoader();
        await fileInput.addEventListener("change", e => {
            if (fileInput.files[0].name.match(/\.(txt|json)$/)) {
                props.onFileGraphsChange(e);
            } else {
                alert(`File not supported, .txt or .json files only`);
            }
        });
    }
    const renderGraphsLoader = () => {
        const el = document.createElement("div");
        el.innerHTML = "<input type='file'/>";
        const fileInput = el.firstChild;
        fileInput.click();
        return fileInput;
    }
    return (

        <button onClick={handleLoadGraphsClick}>Load Graphs File</button>
    )

}