var request = require('request');
var express = require('express');
var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;

var app = express();
var title;
var overview;
var url = "mongodb://localhost:27017";
var moviesDB;
MongoClient.connect(url, {useNewUrlParser : true}, (error , client) => {
	if (error){
		throw error;
	}
    console.log("connected");
    moviesDB = client.db('tmdb');
    moviesDB.collection('movie').find({}).toArray(function(err, docs) {
        console.log(docs)
    });
	//To close the connection
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
        }else  {
            title = response.data.original_title;
            overview = response.data.overview;
            posterpath = response.data.poster_path;
            rating = response.data.vote_average;
            budget = response.data.budget;

            moviesDB.collection('movie').insertOne({
                title : title, 
                overview : overview, 
                image : posterpath, 
                rating : rating, 
                budget : budget, 
                movienumber : movienumber
            });
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


















/*request.get('https://api.themoviedb.org/3/movie/'+movienumber+'?api_key=72b89b76172411ea29cb1f8834895197',{ json: true },(err,res, body)=>{
        if(err){
            console.log('Request failed');
        }
        title = body.original_title;
        overview = body.overview;
        posterpath = body.poster_path;
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
        response.send(myhtml);
    })*/
    // Make a request for a user with a given ID
    