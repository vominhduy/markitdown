console.log("app.js loaded");

const form=document.getElementById("uploadForm");

const fileInput=document.getElementById("fileInput");

const textarea=document.getElementById("markdownText");

const loading=document.getElementById("loading");

const input=document.getElementById("fileInput");

const selected=document.getElementById("selectedFile");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const convertBtn = document.getElementById("convertBtn");
let fileName = "";
let lastSavedPath = "";

input.addEventListener("change",()=>{

    if(input.files.length===0){

        selected.innerHTML="Chưa chọn file";

        return;
    }

    const file=input.files[0];

    const size=(file.size/1024/1024).toFixed(2);
    fileName = file.name;

    selected.innerHTML=`
        📄 <b>${file.name}</b><br>
        ${size} MB
    `;

    convertBtn.disabled = false;
});

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    convertBtn.disabled = true;
    convertBtn.innerHTML = "⏳ Converting...";


    if(fileInput.files.length===0){

        return;
    }

    //loading.classList.remove("hidden");

    const data=new FormData();

    data.append("file",fileInput.files[0]);

    try{

        const response=await fetch("/convert",{

            method:"POST",

            body:data

        });

        const json=await response.json();

        copyBtn.disabled = false;
        downloadBtn.disabled = false;

        convertBtn.disabled = false;
        convertBtn.innerHTML = "🚀 Convert";

        textarea.value=json.markdown;

        //fileName.innerText=json.filename;

        updateStats();
    }

    catch(err){

        alert(err);

    }

    finally{

        //loading.classList.add("hidden");

    }

});

function updateStats(){

    const text=textarea.value;

    const chars=text.length;

    const lines=text.split("\n").length;

    document.getElementById("stats").innerHTML=
    chars+" characters • "+
    lines+" lines";
}

function copyMarkdown(){

    navigator.clipboard.writeText(textarea.value);

    alert("Copied!");
}

function downloadMarkdown() {

    const blob = new Blob(
        [markdownText.value],
        {
            type: "text/markdown;charset=utf-8"
        }
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = fileName + ".md";

    a.click();

    URL.revokeObjectURL(a.href);

}

async function openFile(){

    await fetch("/open-file",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            path:lastSavedPath

        })

    });

}

async function openFolder(){

    await fetch("/open-folder",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            path:lastSavedPath

        })

    });

}