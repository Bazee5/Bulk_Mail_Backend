require("dotenv").config(); // at the top

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://bulk-mail-frontend-three.vercel.app",
      "https://bulk-mail-frontend-git-main-bazees-projects.vercel.app",
      "https://bulk-mail-frontend-b7qcle8pd-bazees-projects.vercel.app"
    ],
    methods: ["POST", "GET"],
    credentials: true,
  })
);


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected To Database"))
  .catch((err) => console.error("Database Connection Failed:", err.message));

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", function (req, res) {
  const { msg, emailList } = req.body;

  credential
    .find()
    .then((data) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER || data[0]?.toJSON().user,
          pass: process.env.EMAIL_PASS || data[0]?.toJSON().pass,
        },
      });

      new Promise(async (resolve, reject) => {
        try {
          for (let i = 0; i < emailList.length; i++) {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: emailList[i],
              subject: "Sending Message From Bulkmail App",
              text: msg,
            });
            console.log("Email Sent to:", emailList[i]);
          }
          resolve("Success");
        } catch (error) {
          console.error("Email send failed:", error);
          reject("Failed");
        }
      })
        .then(() => res.send(true))
        .catch(() => res.send(false));
    })
    .catch((err) => console.log("Credential fetch failed:", err));
});

app.get("/", (req, res) => {
  res.send("Bulk Mail Backend is running.");
});


app.listen(PORT, () => {
  console.log("Server Started on port", PORT);
});
