const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const User = require("./model/User");
const app = express();
let path = require('path')
let multer = require('multer')
let methodOverride = require('method-override')
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
mongoose.set("strictQuery",false);
mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0');
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const user = mongoose.model('user', userSchema);
app.get("/",function(req,res){
    res.render("main");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");

});
app.post("/register", async (req, res) => {
	try {
		const { username, password } = req.body;
		console.log(username);
		// create a new user object
		const user = new User({
			username,
			password
		});

		// save the new user in the database
		await user.save();
		
		return res.status(200).json(user);
	} catch (error) {
		res.status(400).json({ error });
	}
});
app.post("/login", async function(req, res){
	try {
		// check if the user exists
		const user = await User.findOne({ username: req.body.username });
		if (user) {
		//check if password matches
		const result = req.body.password === user.password;
		if (result) {
			res.render("main1");
		} else {
			res.status(400).json({ error: "password doesn't match" });
		}
		} else {
		res.status(400).json({ error: "User doesn't exist" });
		}
	} catch (error) {
		res.status(400).json({ error });
	}
});
app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.clearCookie('connect.sid'); // Clear the cookie session ID
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
            res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
            res.setHeader('Expires', '0'); // Proxies.
            res.redirect('/');
        }
    });
});

app.get('/', function(req, res) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
    res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
    res.setHeader('Expires', '0'); // Proxies.
    res.write('<html><head><meta http-equiv="refresh" content="0; url=/"></head></html>');
    res.end();
});

app.use(function(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
});

  // Showing secret page
app.get("/main1", isLoggedIn, function (req, res) {
    res.render("main1");
});
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect("/login");
}
app.get("/listdetails",function(req,res){
    user.find({},function(err,users){
    if(err) console.log("error");
    else{
        res.render("al_display",{list:users});
    }
        
});

});

app.post("/delete/:id", function(req, res){
    const userID = req.params.id;
    user.findByIdAndDelete(userID, function(err){
    if(err) console.log("error");
    else{
        res.redirect("/listdetails");
    }
    });
});
let myschema = mongoose.Schema({
    Picture : String
})
let mymodel = mongoose.model('table', myschema)

  //Storage Setting
let storage = multer.diskStorage({
    destination:'./public/images', //directory (folder) setting
    filename:(req, file, cb)=>{
        cb(null, file.originalname) // file name setting
    }
})

  //Upload Setting
let upload = multer({
storage: storage,
fileFilter:(req, file, cb)=>{
    if(
        file.mimetype == 'image/jpeg' ||
        file.mimetype == 'image/jpg' ||
        file.mimetype == 'image/png' ||
        file.mimetype == 'image/gif'
    ){
        cb(null, true)
    }
    else{
        cb(null, false);
        cb(new Error('Only jpeg,  jpg , png, and gif Image allow'))
    }
}
})

  //SINGALE IMAGE UPLODING
app.post('/singlepost', upload.single('single_input'), (req, res)=>{
    req.file
    if(!req.file){
        return console.log('You have not Select any Image, Please Select any Image on Your Computer')
    }
    mymodel.findOne({Picture:req.file.filename})
    .then((a)=>{
        if(a){
            console.log("Your Image Dulicate, Please Try anoter Images")
        }
        else{
            mymodel.create({Picture:req.file.filename})
                .then((x)=>{
                    res.redirect('/view')
                })
                .catch((y)=>{
                    console.log(y)
                })
        }
    })
                
    
    //res.send(req.file.filename)
})

  //mULTIPLE IMAGE UPLODING
app.post('/multiplepost', upload.array('multiple_input', 3), (req, res)=>{
    if(!req.files){
        return console.log('You have not Select any Image, Please Select any Image on Your Computer')
    }
    
    req.files.forEach((singale_image)=>{
        
        mymodel.findOne({Picture: singale_image.filename})
        .then((a)=>{
            if(a){
                console.log("Your Image Dulicate, Please Try anoter Images")
            }
            else{
                mymodel.create({Picture: singale_image.filename})
                .then((x)=>{
                    res.redirect('/view')
                })
                .catch((y)=>{
                    console.log(y)
                })
            }
        })
        .catch((b)=>{
            console.log(b)
        })
    })
})

app.get('/gallery',(req, res)=>{
    res.render('index')
})

app.get('/', (req, res)=>{
    res.render('index')
})

app.get('/edit/:id', (req, res)=>{
    let readquery ={_id:req.params.id};
    //console.log(readquery)
    res.render('edit-file', {readquery})
})

app.put('/edit/:id',upload.single('single_input'), (req, res)=>{
    mymodel.updateOne({_id:req.params.id}, {
        Picture : req.file.filename
    })
    .then((x)=>{
        res.redirect('/view')
    })
    .catch((y)=>{
        console.log(y)
    })
})


app.delete('/delete/:id', (req, res)=>{
    let curretn_img_url = (__dirname+'/public/images/'+req.params.id);
   //console.log(curretn_img_url)
    fs.unlinkSync(curretn_img_url)
    mymodel.deleteOne({Picture:req.params.id})
    .then(()=>{
        res.redirect('/view')
    })
    .catch((y)=>{
        console.log(y)
    })
})

app.get('/view', (req, res)=>{
    mymodel.find({})
    .then((x)=>{
        res.render('privew', {x})
        //console.log(x)
    })
    .catch((y)=>{
        console.log(y)
    })
    
}) 
app.get("/home_nav", function (req, res) {
	res.render("main1");
});
app.listen(3000);