import express from "express";
import mongoose from "mongoose";
import findOrCreate from "mongoose-findorcreate";

// import admin from "firebase-admin";
// import serviceAccount from "../firebaseAdminCredentials.json" assert { type: "json" };;

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

const app=express();
//Server will run on http://localhost:4000
const port=4000;
var currUser;

//To tap into the reqest body.
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());  
app.use((req, response, next) => {  
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

//Connect with mongoDb->Tasks database (username & password is mongo);
mongoose.connect("mongodb+srv://mongo:mongo@cluster0.azc9vfb.mongodb.net/Tasks");

//Create schema for tasks , lists and user.
const taskSchema=new mongoose.Schema({
    content:String
});
const listSchema= new mongoose.Schema({
    name:String,
    tasks:[taskSchema]
});
const userSchema =new mongoose.Schema({
  _id:{type:String,
    required:true,
    unique:true,
    background:false,
  },
  email:{type:String,
    required:true,
    unique:true,
    background:false,
  }, 
  lists:[listSchema]
});

userSchema.plugin(findOrCreate);

//Create items to populate tasks for new user;
const Items= mongoose.model("Items",taskSchema);
const item1=new Items({
    content:"You can easily keep track your tasks here",
});
const item2=new Items({
    content:"Try creating new tasks by clicking on + button below.",
});
const item3=new Items({
    content:"You can also create different lists here to separate your tasks.",
});
const defaultItems=[item1,item2,item3];

const Lists= mongoose.model("List",listSchema);
const main= new Lists({
    name:"main",
    tasks:defaultItems,
});
const alt=new Lists({
  name:"alty",
  tasks:defaultItems,
});
const defaultList=[main,alt];
const User= mongoose.model("User",userSchema);
const options={returnDocument:"after"};

//When Email is entered

//IMP:::: NEED TO FIGURE OUT WHAT TO DO WHEN USER IS ALREADY REGISTERED WITH OAUTH
async function findUser(username){
  try{
  var user= await User.findOne({_id:username}).exec()
  if(user){
    return user;
  }else{
    const user=new User({
      id:username,
      lists:defaultList,
    });
    await user.save();
    return user;
    } 
  }catch(error){
      return  User.findOne({_id:username}).exec();
    };
}
async function findUserByEmail(username,email){
  try{
  var user= await User.findOne({email:email}).exec()
  if(user){
    return user;
  }else{
    const user=new User({
      id:username,
      email:email,
      lists:defaultList,
    });
    await user.save();
    return user;
    } 
  }catch(error){
      return  User.findOne({_id:username}).exec();
    };
}

app.post("/",async (req,res)=>{
    const user= await findUser(req.body.username).then(user=>{
      const result=user.lists.map(list=>{return {name:list.name,id:list._id}});
      res.json(result);
    }).catch(error=>{
        console.log(error);
    })
});




//Add new List to DB.
app.post('/addList',async(req,res)=>{
  const newListName=req.body.listName;
    const user=await User.findById(req.user.id).exec();
    const list=await User.findOne({id:req.user.id,"list.name":newListName}).exec();
    if(list) {
      res.status(400).json("List already exist.");
    }else{
      console.log(user);
      user.lists.push(new Lists({name:newListName,tasks:defaultItems}));
      user.save();
      res.json(user);
    }
})

//Delete List from DB.
app.post("/deleteList",async(req,res)=>{
    const listName=req.body.listName;
    const user= await User.findByIdAndUpdate(
      req.user.id,
      {$pull:{lists:{name:listName}}}
    ).exec();
    res.json(user);
 })

//Rename list
app.post("/renameList",async(req,res)=>{
  const oldName=req.body.listName;
  const newName=req.body.newListName;
    const user=await User.findOneAndUpdate(
      {_id:req.user.id,"lists.name":oldName},
      {$set:{"lists.$.name":newName}},
      options,
    ).exec();
    res.json(user);
})



//Delete a task
app.post("/deleteTask",async(req,res)=>{
  const listName=req.body.listName;
  const taskId=req.body.taskId;
    const user=await User.findOneAndUpdate(
      {_id:req.user.id,"lists.name":listName},
      {$pull:{"lists.$.tasks":{_id:taskId}}},
      options
    ).exec();
    res.json(user);
})

app.post("/getUserWithEmail",(req,res)=>{
  console.log(req.body.username);
  // admin.auth()
  // .getUserByEmail(req.body.username)
  // .then((userRecord) => {
  //   // See the UserRecord reference doc for the contents of userRecord.
  //   console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
  //   res.status(200).json("User exist");
  // })
  // .catch((error) => {
  //   console.log('Error fetching user data:', error);
  //   res.status(400).json("user Not found");
  // });
    User.findOne({email:req.body.username}).then(user=>{
      if(user){
        console.log("found");
        res.status(200).json("User exist")
      }else{
        console.log("Not found");
        res.status(400).json("User not found")
      }
    }
      ).catch(error=> console.log(error));
})

app.post("/getTasks",(req,res)=>{
    User.findById(req.body.username).then(user=>{
      const list = user.lists.find((list) => list._id.equals(req.body.list));
      res.json(list.tasks);
    })
})
//Add new task
app.post("/addTask",async(req,res)=>{
  const listId=req.body.list;
  const content=req.body.content;
  const id=req.body.username;
  const item=new Items({content:content});
  await User.findOneAndUpdate(
      {_id:id,"lists._id":listId},
      {$push:{"lists.$.tasks":item}},
      options
    ).then(updatedVal=>{
      res.redirect(307,"/getTasks")}).catch(error=>{
      console.log(error);
    });
    
})

app.post("/addUser",async(req,res)=>{
  const email=req.body.username;
  const id=req.body.id;
  findUserByEmail(email,id);
})

//Get all the lists of user  
app.listen(port,()=>{
    console.log(`Server running on Port:${port}.`);
})