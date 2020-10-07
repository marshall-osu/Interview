const inputElement = document.getElementById("file");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {
    document.getElementById("file-label").innerHTML = this.files[0].name;
}

const fileInput = document.getElementById("file");
fileInput.addEventListener("change", buttonActivation, false);
const filenameInput = document.getElementById("filename");
filenameInput.addEventListener("change", buttonActivation, false);
const categoryInput = document.getElementById("category");
categoryInput.addEventListener("change", buttonActivation, false);
const buttonInput = document.getElementById("upload-file");

document.getElementById("upload-file").disabled = true;

function buttonActivation(){
    if(fileInput.value && filenameInput.value && categoryInput.value){
        buttonInput.disabled = false;
    } else {
        buttonInput.disabled = true;
    }
}

getFiles();
function getFiles(){
    $(document).ready(function(){
        $.get('/files', function(data){
            showFiles(data);
        })

        function showFiles(files){
            const categoryMap = new Map();
            for(var i = 0; i < files.length; i++){
                if(!categoryMap.has(files[i].category)){
                    var categoryDiv = document.createElement('div');
                    categoryDiv.setAttribute("id", files[i].category);
                    categoryDiv.setAttribute("class", "category");
                    var header = document.createElement('h3');
                    header.innerHTML = files[i].category;
                    document.getElementsByClassName('script-output')[0].appendChild(header);
                    document.getElementsByClassName('script-output')[0].appendChild(categoryDiv);
                    categoryMap.set(files[i].category, categoryDiv);
                }
                var newChild = document.createElement('div');
                newChild.setAttribute("id", "document");
                var link = document.createElement('a');
                link.setAttribute("href", files[i].path)
                link.innerHTML = files[i].name
                newChild.appendChild(link);
                var deleteForm = document.createElement('form');
                deleteForm.setAttribute("action", `/?_method=DELETE&path=${files[i].path}`);
                deleteForm.setAttribute("method", "POST");
                var deleter = document.createElement('button');
                deleter.setAttribute("name", "delete");
                deleter.setAttribute("type", "submit");
                deleter.setAttribute("class", "btn btn-outline-secondary");
                deleter.innerHTML = "Delete";
                deleteForm.appendChild(deleter);
                newChild.appendChild(deleteForm);
                categoryMap.get(files[i].category).appendChild(newChild);
            }
        }
    })
}

