//jshint esverion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const pass = process.env.ABC;

mongoose.connect("mongodb+srv://shreyashgawande48:"+pass+"@cluster0.hukbecs.mongodb.net/sp",{useNewUrlParser:true});
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

const userSchema = new mongoose.Schema({
  account_no : Number,
  mail:String,
  name:String,
  balance:Number
});
const transSchema = new mongoose.Schema({
  send:Number,
  rec:Number,
  amount:Number
});
const Transaction = mongoose.model("Transaction",transSchema);
const User = mongoose.model("User",userSchema);
const item = new User(
  {
    account_no: 101,
    mail:"xys@gmail.com",
    name: "Shreyash Gawande",
    balance:1000
  }
);
const tran = new Transaction({
  send:101,
  rec:102,
  amount:100
});
// tran.save();

// item.save();

app.get('/transfer',function(req,res){
  res.render("transfer");
});
app.get('/transactions',function(req,res){
  Transaction.find({},function(err,foundTransactions){
    if(!err){
      res.render("transactions",{trans:foundTransactions});
    }
    else{
      console.log(err);
    }
  });

});
app.get('/viewone',function(req,res){

  res.render("viewone");
});
app.get('/viewall',function(req,res){
  User.find({},function(err,foundlist){
    if(!err){
    res.render("viewall",{users:foundlist});
  }
  else{
    console.log(err);
    res.send(err);
  }
  })

});
app.get('/',function(req,res){
  res.render("index");
});
app.get('/add',function(req,res){
  res.render("add");
});
app.get('/fail',function(req,res){
  res.render("status");
});

app.post('/login',function(req,res){
  User.find({account_no:req.body.accountNo},function(err,foundUser){

    if(foundUser.length>0 && foundUser[0].mail===req.body.mail){

      res.render("user",{user:foundUser[0]});
    }else{
      res.send("Invalid Credentials");
    }
  })

});
app.post('/transfer',function(req,res){
    console.log(req.body);

  User.findOne({account_no:req.body.senderaccount_no},function(err,foundUser){
    if(foundUser && foundUser.balance>=req.body.amount){
      console.log("found sender");
      User.findOne({account_no:req.body.reciever_account_no},function(err,foundRec){
        if(!err){
          console.log("Reciever found");
          User.updateOne({account_no:req.body.senderaccount_no},{$inc:{
            balance:-req.body.amount
          }},
            function(err){
              if(!err){
                console.log("Successfully updated");
              }
            }
          );
          User.updateOne({account_no:req.body.reciever_account_no},{$inc:{
            balance:req.body.amount
          }},
            function(err){
              if(!err){
                console.log("Seccessfully updated");
              }
            });
          const tran = new Transaction({
            send:req.body.senderaccount_no,
            rec:req.body.reciever_account_no,
            amount:req.body.amount
          });
          tran.save(function(err){
            if(err){
              console.log(err);
              res.render("status",{status:"fail"});
            }


          });
          res.render("status",{status:"Success"});

        }
        else{
          console.log("Reciever not found")
        }

      });

    }
    else{
      console.log("sender not found");
    }

  });
  // res.send("Success");
  // res.redirect("/");
});
app.post('/entry',function(req,res){
  console.log(req.body.name);
  console.log(req.body.account_no);
  console.log(req.body.email);
  console.log(req.body.balance);
  const user1= new User({
    name : req.body.name,
    account_no : req.body.account_no,
    mail : req.body.email,
    balance:req.body.balance
  });
  user1.save(function(err){
    if(!err){
      console.log("added");
      res.redirect("viewall");

    }
    else{
      console.log(err);
    }
  })
});
const PORT = process.env.PORT||5000;
app.listen(PORT,function(){
  console.log("Server is running on localhot :"+PORT);
})
