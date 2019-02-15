var request = require('request');
var express = require('express');
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var title;
var overview;
var url = "mongodb://localhost:27017";

databaseConnection(url, MongoClient);

databaseConnection(url, MongoClient).then((moviesDB)=>{
        if(moviesDB != undefined)   
            console.log('Inside moviesDB'); 
            initDatabase(moviesDB);
        },function(err) {
            console.log('moviesDB Undefined');; // Error: "It broke"
}); 

 function databaseConnection(url, MongoClient)  {
    return new Promise((resolve, reject) =>{
        var moviesDB;
        MongoClient.connect(url, {useNewUrlParser : true}, (error , client) => {
            if (error){
                throw error;
            }
            console.log("connected");
            moviesDB = client.db('tmdb');
            
                if(moviesDB != undefined)    
                    resolve(moviesDB);
                else
                    reject('moviesDB Undefined');
        }); 
    });
}
 
function initDatabase(db)  {
    console.log('inside moviesDB');
    for(var i = 1; i <= 20; i++)  {     
        url = 'https://api.themoviedb.org/3/discover/movie?with_genres=28&page='+i+'&sort_by=vote_average.desc&api_key=72b89b76172411ea29cb1f8834895197'
        axios.get(url).then((jsondata) => {
            insertPageToDatabase(jsondata.data.results, db);
        }).catch(err=>{
            console.log('Request Failed'+err);
        });
    }
}


function insertPageToDatabase(results, moviesDB)  {
    results.forEach((movie)=>{
        console.log(movie.original_title);
        moviesDB.collection('movie').insertOne({
            title : movie.original_title, 
            overview : movie.overview, 
            image : movie.poster_path, 
            rating : movie.vote_average, 
            budget : movie.budget, 
            movienumber : movie.id
        });
    })
}

// use tmdb
// db.movie.countDocuments({})
// db.movie.remove({title:{$ne:"test"}});






app.get('/', function(req, responseToClient){
    //res.send(title);
    var movienumber = req.query.movienumber != undefined?req.query.movienumber:551;
    console.log(req.params);
    responseToClient.set('Content-Type', 'text/html');
    axios.get('https://api.themoviedb.org/3/movie/'+movienumber+'?api_key=72b89b76172411ea29cb1f8834895197')
    .then(function (response) {
        statuscode = response.data.status_code;
        if(statuscode == 34)  {
            responseToClient.redirect('/');
        }
    }).catch(function (error) {
    // handle error
    console.log(error);
    }).then(function(){
        var myhtml ='<html>\
                        <title>My Movies</title>\
                        <body>\
                            <form action="\" method = "get">\
                            Enter Movie Number:<br>\
                            <input type="text" name="movienumber">\
                            <input type="submit" value="Submit">\
                            </form> \
                            <P>Title: '+title+'</p><br>'+overview+'</p>\
                            <img src = "https://image.tmdb.org/t/p/w342/'+posterpath+'">\
                        </body>\
                    </html>';
        responseToClient.send(myhtml);
    });
})

app.listen(3000);
