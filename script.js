
let huffmanRoot = null;
let huffmanCodes = {};
let lastEncodedText = "";

// Build a Huffman tree and generate codes
function buildHuffmanTree(text) {
    const frequencies = new Map();

    for (const char of Array.from(text)) {
        frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }

    let nodes = [];

    for (const [char, frequency] of frequencies) {
        nodes.push({
            char: char,
            frequency: frequency,
            left: null,
            right: null
        });
    }

    // Special case: empty text
    if (nodes.length === 0) {
        return { root: null, frequencies };
    }

    // Repeatedly combine the two lowest-frequency nodes
    while (nodes.length > 1) {
        nodes.sort((a, b) => a.frequency - b.frequency);

        const left = nodes.shift();
        const right = nodes.shift();

        const parent = {
            char: null,
            frequency: left.frequency + right.frequency,
            left: left,
            right: right
        };

        nodes.push(parent);
    }

    return {
        root: nodes[0],
        frequencies
    };
}

// Generate a binary code for every character
function generateCodes(node, code, codes) {
    if (node === null) return;

    // Leaf node represents a character
    if (node.left === null && node.right === null) {
        codes[node.char] = code || "0";
        return;
    }

    generateCodes(node.left, code + "0", codes);
    generateCodes(node.right, code + "1", codes);
}

// Display the frequency and code table
function displayCodes(frequencies, codes) {
    let html = `
        <table>
            <tr>
                <th>Character</th>
                <th>Frequency</th>
                <th>Huffman Code</th>
            </tr>
    `;

    for (const [char, frequency] of frequencies) {
        let displayChar = char === " " ? "Space" :
                          char === "\n" ? "Newline" : char;

        html += `
            <tr>
                <td>${escapeHTML(displayChar)}</td>
                <td>${frequency}</td>
                <td>${codes[char]}</td>
            </tr>
        `;
    }

    html += "</table>";
    document.getElementById("codes").innerHTML = html;
}

// Prevent text from being interpreted as HTML
function escapeHTML(text) {
    return text.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Encoding function
function encodeText() {
    const text = document.getElementById("inputText").value;
    const message = document.getElementById("message");

    if (text.length === 0) {
        message.textContent = "Please enter some text.";
        return;
    }

    const result = buildHuffmanTree(text);

    huffmanRoot = result.root;
    huffmanCodes = {};

    generateCodes(huffmanRoot, "", huffmanCodes);

    lastEncodedText = Array.from(text)
        .map(char => huffmanCodes[char])
        .join("");

    document.getElementById("encodedText").value = lastEncodedText;
    document.getElementById("decodedText").value = "";

    displayCodes(result.frequencies, huffmanCodes);

    message.textContent = "Text encoded successfully!";
}

// Decoding function
function decodeText() {
    const binary = document.getElementById("encodedText").value;
    const message = document.getElementById("message");

    if (huffmanRoot === null || lastEncodedText === "") {
        message.textContent = "Encode some text first.";
        return;
    }

    // Only accept binary digits
    if (!/^[01]*$/.test(binary)) {
        message.textContent = "Encoded text must contain only 0 and 1.";
        return;
    }

    // Single-character input has a special code: 0
    if (huffmanRoot.left === null && huffmanRoot.right === null) {
        if (!/^0*$/.test(binary)) {
            message.textContent = "Invalid binary code for this tree.";
            return;
        }

        const decoded = huffmanRoot.char.repeat(binary.length);
        document.getElementById("decodedText").value = decoded;
        message.textContent = "Text decoded successfully!";
        return;
    }

    let decoded = "";
    let current = huffmanRoot;

    for (const bit of binary) {
        current = bit === "0" ? current.left : current.right;

        if (current === null) {
            message.textContent = "Invalid binary sequence.";
            return;
        }

        // A leaf node means one character is decoded
        if (current.left === null && current.right === null) {
            decoded += current.char;
            current = huffmanRoot;
        }
    }

    // The code must finish at the root
    if (current !== huffmanRoot) {
        message.textContent = "Incomplete binary sequence.";
        return;
    }

    document.getElementById("decodedText").value = decoded;
    message.textContent = "Text decoded successfully!";
}
