// generate-mermaid.js
const fs = require("fs");
const path = require("path");

const jsonData = require("./data.json");

let mermaidLines = ["graph TD"];
let nodeCounter = 0;

function sanitize(value) {
    return String(value).replace(/[\n\r<>]/g, ' ').slice(0, 50) + (String(value).length > 50 ? '...' : '');
}

function getType(val) {
    if (Array.isArray(val)) return 'array';
    if (val === null) return 'null';
    return typeof val;
}

function addNode(parentId, key, value) {
    const nodeId = `node${++nodeCounter}`;
    const type = getType(value);

    let label = `${key}<br/>(${type})`;
    if (type !== 'object' && type !== 'array') {
        label += `<br/>${sanitize(value)}`;
    }

    mermaidLines.push(`${nodeId}["${label}"]`);

    if (parentId) {
        mermaidLines.push(`${parentId} --> ${nodeId}`);
    }

    if (type === 'object') {
        for (const [childKey, childVal] of Object.entries(value)) {
            addNode(nodeId, childKey, childVal);
        }
    } else if (type === 'array') {
        value.forEach((item, idx) => addNode(nodeId, `item[${idx}]`, item));
    }
}

addNode(null, "root", jsonData);

fs.writeFileSync("output.mmd", mermaidLines.join("\n"));
console.log("✅ Mermaid diagram written to output.mmd");
