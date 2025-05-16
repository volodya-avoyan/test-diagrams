const fs = require("fs");
const path = require("path");

let [,, inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
    console.error("❌ Usage: node generate-mermaid.js <input.json> <output.mmd>");
    process.exit(1);
}

inputPath = './data/' + inputPath + '.json';
outputPath = './diagrams/' + outputPath + '.mmd'

let jsonData;
try {
    const raw = fs.readFileSync(path.resolve(inputPath), "utf8");
    jsonData = JSON.parse(raw);
} catch (err) {
    console.error(`❌ Error reading or parsing JSON from ${inputPath}:`, err.message);
    process.exit(1);
}

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

try {
    fs.writeFileSync(path.resolve(outputPath), mermaidLines.join("\n"), "utf8");
    console.log(`✅ Mermaid diagram written to ${outputPath}`);
} catch (err) {
    console.error(`❌ Error writing to ${outputPath}:`, err.message);
    process.exit(1);
}
