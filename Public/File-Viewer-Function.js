function getFiles(){
    $.get('/files', function(data){
        if(!data){
            console.log('No data recieved');
        }
        console.log('Recieved data:');
        for(var i = 0; i , data.length; i++){
            console.log(data[i].name);
        }
        showFiles(data);
    })

    function showFiles(files){
        files[0].name;
        files[0].path;
        files[0].catagory;
    }
}