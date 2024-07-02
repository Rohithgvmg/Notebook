import express from "express"
import bodyParser from "body-parser"
import axios from "axios"
import pg from "pg"

const app=express();
const port=3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('views'));
app.set('view engine', 'ejs');

const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"Notebook", //create your own database in postgres and put that name here
  password:"******", //drop your password for postgres
  port:5432,
});

db.connect();

app.get("/",async (req,res)=>{
  try{
   const result=await db.query("SELECT * FROM bookdetails");
   res.render("index.ejs",{data:result.rows});
  } catch(err){
    console.log("Error while getting data from database");
  }
})

app.get("/new",async (req,res)=>{
    
    res.render("new.ejs");

})

app.post("/new",async(req,res)=>{
  try{
  const result= await db.query("INSERT INTO bookdetails(picture,title,content,time) VALUES($1,$2,$3,$4);",["https://covers.openlibrary.org/b/"+req.body.ID+"-L.jpg",req.body.Title,req.body.Content,req.body.Time]);
  console.log(result);
   res.redirect("/");
  } catch (err){
    console.log("Error while adding book");
  }
   }
)


app.post("/edit", async(req,res)=>{
      
       const id=req.body.id;
       const result= res.render("edit.ejs",{id:id});
})

app.post("/edited", async(req,res)=>{
    
      try{
      await db.query("UPDATE bookdetails SET title=$1, content=$2, rating=$3, time=$4 WHERE id=$5", [req.body.Title, req.body.Content, req.body.Rating, req.body.Time, req.body.id]);
      res.redirect("/");
      } catch (err) {
        console.log("Error while updating data ");
      }
})

app.post("/delete",(req,res)=>{
     
  const id=req.body.id;
  try{
  db.query("DELETE FROM bookdetails WHERE id=$1",[id]);
    res.redirect("/");
  } catch (err){
    console.log("Error while deleting entry");
  }
      
})

app.post("/filter", async (req,res)=>{

  const filter = req.body.filter;
  try{
  if (filter== "latest"){
      const result= await db.query(" SELECT * FROM bookdetails ORDER BY time ASC");
      // console.log(result.rows);
      if(result){
       res.render("index.ejs",{data:result.rows});
      }
  }

  if (filter == "most_liked"){
    const result= await db.query(" SELECT * FROM bookdetails ORDER BY rating DESC");
    if (result){
    res.render("index.ejs",{data:result.rows});
    }

  }
} catch(err){
  console.log("Error while filtering");
}

})

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});




