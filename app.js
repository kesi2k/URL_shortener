// require and use express

var express = require ('express');
var app = express();

var port = process.env.PORT;

// Path module to allow concatenation of paths

var path = require ('path');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var config = require('./config');

//for encoding and decoding funcitons

var base62 = require('./base62.js');

// Get the Url model
var Url = require('./models/url');


var validateURL = require('./validateURL.js');

// Create a connection to our MongoDb

mongoose.connect('mongodb://'+config.db.host + '/' + config.db.name);


// Connection for Heroku app

//mongoose.connect('mongodb://heroku_5z06p34m:1jq8h0npqnl15rrtkl474ghlcj@ds017165.mlab.com:17165/heroku_5z06p34m');


// handles JSON bodies
app.use(bodyParser.json());

// handles URL encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serves files in our public directory

app.use("/public", express.static(__dirname + "/public"));


// route to serve the homepage


app.get('/favicon.ico', function (request, response){
     response.writeHead(200, {'Content-Type': 'image/x-icon'} );
     response.end();
    console.log('favicon requested');
    return;
    
});


app.get ('/', function (request,response){
    

    
    response.sendFile(path.join(__dirname + "/views/index.html"));
    
    
});


// route to create and return a shortened URL given a long URL

app.get("/new/:urlid*",function (request, response){
    
    var longUrl = request.url.split("/").slice(2).join("/");
    var shortUrl = "";
    
 // checks to see if URL is valid
 
 if(!validateURL.checkURL(longUrl)){
     
          console.log(validateURL.checkURL(longUrl));    
          response.send ('This is not a valid URL');   
     
     
 }
    
 // check for Url in DB
 else {
 
 
 
 Url.findOne ({long_url: longUrl}, function (err, doc){
      
      if (err){
          
          console.log(err)
      }

// if document exists we take the _id and encode it. Then return the shortened URL
     
     if(doc){
         
         shortUrl = config.webhost + "/" + base62.encode(doc._id)
         
         response.json ({
             
             'Original URL': doc.long_url,
             'ShortUrl': shortUrl,
             'Database id': doc._id,
             'Created': doc.created_at
             
         });
         
     }
    
    else {
      // no document for the Url. we create a new entry  
      var newUrl = Url({ long_url: longUrl }); 
      
      //save the entry
      
      newUrl.save (function(err){
          
          if (err){
              
              console.log(err);
          }
          
    // construct the short URL
          
    shortUrl =  config.webhost + "/" + base62.encode(newUrl._id);
    response.json ({
             
             'Original URL': longUrl,
             'ShortUrl': shortUrl,
            
         });
          
      });
        
    }
  console.log(doc);
  
 });    
  
 }
 

 
 
 
 
});




app.get('/:encoded', function (request, response){
  
  var encodedID = request.params.encoded;
  var iD = base62.decode(encodedID);
    
    
    console.log(encodedID);
    console.log('This is decoded ID:', iD);
 // Check to see if URL exists in DB 
 
  Url.findOne({_id:iD}, function (err, doc){
      
    if (err){
        console.log(err);
    }  
     
     if (doc){
         
        response.redirect(doc.long_url);
         
         
     }
      else {
          
         response.send('URL not stored in database')
          
      }
      
  });
  
    
});







var server = app.listen(port, function(){console.log("Listening on port: ", port)});