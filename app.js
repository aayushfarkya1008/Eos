var request = require('request');
var express = require('express');
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var title;
var overview;
var url = "mongodb://localhost:27017";
databaseConnection(url, MongoClient).then((moviesDB)=>{
    if(moviesDB != undefined)    
        initDatabase(moviesDB);
    else
        console.log('moviesDB Undefined');
    });
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


app.listen(3003);

async function databaseConnection(url, MongoClient)  {
    var moviesDB;
    await MongoClient.connect(url, {useNewUrlParser : true}, (error , client) => {
        if (error){
            throw error;
        }
        console.log("connected");
        moviesDB = client.db('tmdb');
        return moviesDB;
        moviesDB.collection('movie').find({}).toArray(function(err, docs) {
            //console.log(docs)
        });
        //To close the connection
    });
}

 async function initDatabase(db)  {
    for(var i = 1; i <= 20; i++)  {     
        url = 'https://api.themoviedb.org/3/discover/movie?with_genres=28&page='+i+'&sort_by=vote_average.desc&api_key=72b89b76172411ea29cb1f8834895197'
        requestTMDB(url).
        then((jsondata) => {
            insertPageToDatabase(jsondata.data.results, db);
        });
    }
}

async function requestTMDB(url)  {
    let responseFromApi = await axios.get(url);
    return responseFromApi;
    
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








