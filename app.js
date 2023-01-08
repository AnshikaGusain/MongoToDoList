const express = require("express");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const dotenv=require("dotenv");


const app = express();

dotenv.config();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
mongoose.set('strictQuery',false);
console.log(process.env.PASSWORD);
mongoose.connect(`mongodb+srv://admin-anshika:${process.env.PASSWORD}@cluster0.wzrpvnt.mongodb.net/toDoListDB`);

const itemsSchema={
    name:{
        type: String,
        required:[true,"Please check your data no name is specified"]
    }
}

const Item=mongoose.model("item",itemsSchema);
// const item1= new Item({
//     name:"Buy food"
// })
// const item2= new Item({
//     name:"Cook food"
// })
// const item3= new Item({
//     name:"Eat food"
// })

// const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemsSchema]
}

const List= new mongoose.model("list",listSchema);

app.get("/", (req, res) => {
    let day = date.getDate();
    Item.find((err,items)=>{
        if(err)console.log(err);
        // if(items.length===0){    
        //     Item.insertMany(defaultItems,(err)=>{
        //         if(err)console.log(err);
        //         else{
        //             console.log("successfully added");
        //         }
        //     })
        //     res.redirect("/");
        // }
        else{
            res.render("list", { ListTitle: "Today", newItems: items });
            // items.forEach(item=>console.log(item));
        }
    })
})

app.post("/", (req, res) => {
    const listName=req.body.list;
    let itemName = req.body.newItem;
    // console.log(listName);
    const item= new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},(err,foundList)=>{
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);
            }
        })
    }
})

app.post("/delete",(req,res)=>{
    const checkedItemID=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemID,(err)=>{
            if(err)console.log(err);
            else{
                // console.log("successfully deleted");
                res.redirect("/");
            }
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
    // Item.deleteOne({_id:checkedItemID},(err)=>{
    //     if(err)console.log(err);
    //     else{
    //         console.log("successfully deleted");
    //         res.redirect("/");
    //     }
    // })
})


app.get("/:customListName", (req, res) => {
    const customListName=_.capitalize(req.params.customListName);
    
    List.findOne({name:customListName},(err,foundList)=>{
        if(err)console.log(err)
        else{
            if(!foundList){
                // console.log("Doesn't exist");
                const list=new List({
                    name:customListName,
                    items:[]
                })
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                // console.log("exists");
                let day = date.getDate();
                res.render("list", { newItems: foundList.items, ListTitle: foundList.name});
            }
        }
    })
})

app.get("/about", (req, res) => {
    res.render("about");
})


app.listen(process.env.PORT || 3000, () => {
    console.log("server is running successfully");
})