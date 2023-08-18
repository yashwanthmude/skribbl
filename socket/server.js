const express = require("express");
const config = require("./config");
const util = require('util');
const cors = require("cors");
const query = util.promisify(config.query).bind(config);
const mysql = require("mysql2/promise");

const app = express();

const PORT = 3002;
app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// app.use('/login', (req, res) => {
//   res.send({
//     token: 'test123'
//   });
// });
// Route to get all Users
app.get("/api/get", async (req, res) => {
  try {
    let users = await query("SELECT * FROM skribbl", (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
  } catch (error) {
    console.log(error);
  }
});

// Route to get one user
app.get("/api/getFromId/:Id", async (req, res) => {
  try {
    const Id = req.params.Id;
    let users = await query(`SELECT * FROM skribbl WHERE Id = ${Id}`, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.send(result);
      });
  } catch (error) {
    console.log(error);
  }
});
//get all users from roomid
app.get("/api/getFromRoomId/:roomId", async (req, res) => {
    try {
      const Id = req.params.roomId;
      let pool = await query(`SELECT * FROM skribbl WHERE roomid = '${Id}'`, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.log("hii");
          console.log(result);
          res.send(result);
        });
    } catch (error) {
      console.log(error);
    }
  });
  app.get("/api/gethighestscore/:username", async (req, res) => {
    try {
      const username = req.params.username;
      console.log(username);
      let pool = await query(`SELECT * FROM skribbl WHERE UserName = '${username}'`, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.log("hii");
          console.log(result);
          res.send(result);
        });
    } catch (error) {
      console.log(error);
    }
  });

app.post("/api/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    let users = await query(
        `SELECT * FROM skribbl WHERE UserName = '${username}' AND Password='${password}'`,
        (err, result) => {
          if (err) {
            console.log(err);
          }
          console.log(result);
          res.send(result);
        }
      );
  } catch (error) {
    console.log(error);
  }
});

// Route for creating the user
app.post("/api/create", async (req, res) => {
  const UserName = req.body.UserName;
  const Password = req.body.Password;
  const Name = req.body.Name;

  // console.log(UserName, Password, Name);

  try {
    let users = await query(
        `INSERT INTO skribbl (UserName,Password,Name,Totalgamesplayed,Highestscore,roomid) VALUES ('${UserName}','${Password}','${Name}',0,0,'notknown')`,
        (err, result) => {
          if (err) {
            console.log(err);
          }
          console.log(result);
        }
      );
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/updateroomid/:databaseid", async (req, res) => {
    // console.log("hiiiii");
    const databaseId = req.params.databaseid;
    const roomId=req.body.roomid;
    // console.log(roomId);
    try {
      let pool = await query(
            `UPDATE skribbl SET roomid='${roomId}' WHERE Id=${databaseId}`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log(result);
          }
        );
    } catch (error) {
      console.log(error);
    }
  });

  //update high score
  app.post("/api/updatepoints/:username/:points", async (req, res) => {
    // console.log("hiiiii");
    const points = req.params.points;
    const username=req.params.username;

    // console.log(roomId);
    try {
      let pool = await query(
            `UPDATE skribbl SET Highestscore=${points} WHERE UserName='${username}'`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log(result);
          }
        );
    } 
    catch (error) {
      console.log(error);
    }
  });

  app.post("/api/updatetotalgames/:databaseid", async (req, res) => {
    // console.log("hiiiii");
    const databaseId = req.params.databaseid;
    // console.log(roomId);
    try {
      let pool = await query(
            `UPDATE skribbl SET Totalgamesplayed = Totalgamesplayed+1 WHERE Id=${databaseId}`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log(result);
          }
        );
    } catch (error) {
      console.log(error);
    }
  });
  

// Route to delete a user

app.delete("/api/delete/:Id", async (req, res) => {
  try {
    const Id = req.params.Id;

    let pool = await query(`DELETE FROM skribbl WHERE Id= ${Id}`, (err, result) => {
        if (err) {
          console.log(err);
        }
      });
  } catch (error) {
    console.log(error);
  }
});