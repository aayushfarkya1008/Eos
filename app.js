var request = require('request');
var express = require('express');
var app = express();
var imageurl ;
var title;
var overview;
app.get('/', function(req, response){
    //res.send(title);
    var movienumber = req.query.movienumber != undefined?req.query.movienumber:551;
    console.log(req.params);
    response.set('Content-Type', 'text/html');
    request.get('https://api.themoviedb.org/3/movie/'+movienumber+'?api_key=72b89b76172411ea29cb1f8834895197',{ json: true },(err,res, body)=>{
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
    })
})


app.listen(3000);