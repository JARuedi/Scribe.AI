async function uploadPDF() {
    const fileInput = document.getElementById("pdfFile");
    const fileLabel = document.getElementById("fileLabel");
    const result = document.getElementById("result");
    const downloadBtn = document.getElementById("downloadBtn");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a PDF first.");
        return;
    }

    // Hide download button while processing
    downloadBtn.style.display = "none";
    result.textContent = "";
    document.getElementById("loadingContainer").style.display = "block";

    const formData = new FormData();
    formData.append("file", file);

    console.log("PDF Received!");

    try {
        /*
        The Try function, 
        */
        const response = await fetch("http://127.0.0.1:8000/simplify", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            document.getElementById("loadingContainer").style.display = "none";
            const errorText = await response.text();
            console.error("Server error response:", errorText);
            result.style.color = "#e74c3c";
            result.textContent = `Server returned an error (${response.status}). Check your terminal for details.`;
            return;
        }

        const data = await response.json();

        if (data.simplified) {
            document.getElementById("loadingContainer").style.display = "none";
            result.style.color = "#e0e0e0";
            result.textContent = data.simplified;
            console.log("PDF Simplified!");

            // Show download button
            downloadBtn.style.display = "inline-block";
            downloadBtn.onclick = () => downloadResult(data.simplified, file.name);
        } else {
            result.style.color = "#e74c3c";
            result.textContent = "Received a response, but no simplified text was found.";
        }

    } 
    //Catching any error, if connection of the local server is lost, and if not to display said error.
    catch (error) {
        document.getElementById("loadingContainer").style.display = "none";
        result.style.color = "#e74c3c";
        result.textContent = "Error connecting to server. Is it running? (uvicorn rag_project_scribeAI:app --reload)";
        console.error("Fetch error:", error);
    }
}

// Update file label when a file is chosen
document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("pdfFile");
    const fileLabel = document.getElementById("fileLabel");

    fileInput.addEventListener("change", () => {
        if (fileInput.files[0]) {
            fileLabel.textContent = `📄 ${fileInput.files[0].name}`;
        } else {
            fileLabel.textContent = "Choose File";
        }
    });
});

//Button used to download the new txt file.
function downloadResult(text, originalFilename) {
    const baseName = originalFilename.replace(/\.pdf$/i, "");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_simplified.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
