getFiles();
function getFiles(){
    $(document).ready(function(){
        $.get('/files', function(data){
            if(!data){
                console.log('No data recieved');
            }
            console.log('Recieved data:');
            for(var i = 0; i < data.length; i++){
                console.log(data[i].name);
            }
            showFiles(data);
        })

        function showFiles(files){
            for(var i = 0; i < files.length; i++){
                var newChild = document.createElement('div');
                var category = document.createElement('p');
                category.innerHTML = 'Category: ' + files[i].category;
                newChild.appendChild(category);
                var link = document.createElement('a');
                link.setAttribute("href", files[i].path)
                link.innerHTML = files[i].name
                newChild.appendChild(link);
                var deleteForm = document.createElement('form');
                deleteForm.setAttribute("action", `/?_method=DELETE&name=${files[i].name}`);
                deleteForm.setAttribute("method", "POST");
                var deleter = document.createElement('button');
                deleter.setAttribute("name", "delete");
                deleter.setAttribute("type", "submit");
                deleter.innerHTML = "Delete this file";
                deleteForm.appendChild(deleter);
                newChild.appendChild(deleteForm);
                document.getElementById('file-output').appendChild(newChild);
            }
        }
    })
}