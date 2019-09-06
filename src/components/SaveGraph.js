import React, { Component } from 'react'

export default function SaveGraph (props) {
    const handleSaveGraphs = e => {
        const a = document.createElement("a");
        document.body.appendChild(a);
        const data = props.data;
        const fileName = "graphs.json";
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: "octet/stream" });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
        return (          
            <button onClick={handleSaveGraphs}>Save Graphs</button>       
        )
  
}
