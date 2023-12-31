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
const port = process.env.PORT || 3030;

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
// async function findUser(username){
//   try{
//   var user= await User.findOne({_id:username}).exec()
//   if(user){
//     return user;
//   }else{
//     const user=new User({
//       id:username,
//       lists:defaultList,
//     });
//     await user.save();
//     return user;
//     } 
//   }catch(error){
//       return  User.findOne({_id:username}).exec();
//     };
// }
async function findUserByEmail(username,email){
  console.log(username,email);
  try{
  var user= await User.findOne({email:email}).exec()
  if(user){
    console.log("Dum Dum ");
    return user;
  }else{
    const user=new User({
      _id:username,
      email:email,
      lists:defaultList,
    });
    await user.save();
    return user;
    } 
  }catch(error){
      console.log(error);
      return  User.findOne({_id:username}).exec();
    };
}

app.post("/",async (req,res)=>{
    console.log(req.body.username);
    const user= await User.findById(req.body.username).then(user=>{
      if(user){
          const result=user.lists.map(list=>{return {name:list.name,_id:list._id}});
          res.json(result);
      }
    }).catch(error=>{
        console.log(error);
    })
});




//Add new List to DB.
app.post('/addList',async(req,res)=>{
  const newListName=req.body.listName;
  const id=req.body.username
  await User.findOneAndUpdate(
    {_id:id},
    {$push:{"lists":new Lists({name:newListName,tasks:defaultItems})}},
    options
  ).then(user=>{
      res.json(user.lists);
  }).catch(error=>{
    console.log(error);
  });
      
})


//Delete List from DB.
app.post("/deleteList",async(req,res)=>{
    const listId=req.body.listId;
    const id=req.body.username;
    const user= await User.findByIdAndUpdate(
      id,
      {$pull:{lists:{_id:listId}}},options
    ).exec().then(user=>{
        console.log(user.lists);
        res.json(user.lists);
    }).catch(error=>console.log(error));
 })

//Rename list
app.post("/renameList",async(req,res)=>{
  const listId=req.body.listId;
  const newName=req.body.newListName;
  const id=req.body.username
    const user=await User.findOneAndUpdate(
      {_id:id,"lists._id":listId},
      {$set:{"lists.$.name":newName}},
      options,
    ).exec().then(user=>{
        res.json(user.lists);
    }).catch(error=>console.log(error));
})



//Delete a task
app.post("/deleteTask",async(req,res)=>{
  const listId=req.body.list;
  const taskId=req.body.taskId;
  const userId=req.body.username;
    const user=await User.findOneAndUpdate(
      {_id:userId,"lists._id":listId},
      {$pull:{"lists.$.tasks":{_id:taskId}}},
      options
    ).exec().then(user=>{
      const list = user.lists.find((list) => list._id.equals(req.body.list));
      res.json(list.tasks);
    }).catch(error=>console.log(error));
})

app.post("/getUserWithEmail",(req,res)=>{
  console.log(req.body.username);
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

app.post("/getTasks",async(req,res)=>{
  console.log(req.body.username,req.body.list);
    await User.findById(req.body.username).then(user=>{
      const list = user.lists.find((list) => list._id.equals(req.body.list));
      if(list)res.json([list.tasks,list.name]);
    })  .catch(error=>console.log(error));
})
//Add new task
app.post("/addTask",async(req,res)=>{
  const listId=req.body.list;
  const content=req.body.content;
  const id=req.body.username;
  const taskId =req.body.taskId;
  const item=new Items({content:content,_id:taskId});
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
  console.log("user registered");
  const user=findUserByEmail(id,email);
  console.log("New User",user);
})

//Get all the lists of user  
app.listen(port,()=>{
    console.log(`Server running on Port:${port}.`);
})