import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import jwt from "jsonwebtoken"

export const register = (req: express.Request, res: express.Response) => {
  // check existing user
  const q = "SELECT * FROM users WHERE email = ? OR name = ?";
  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length) return res.status(409).json("User already exists!");

    // encrypt password and create username
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const insertQuery = "INSERT INTO users (`name`, `email`, `password`) VALUES (?)";
    const values = [
      req.body.name,
      req.body.email,
      hash,
    ];

    db.query(insertQuery, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created");
    });
  });
};


export const login = (req: express.Request, res: express.Response) => {
  // Implement login logic here
  const selectQuery = "SELECT * FROM users WHERE username = ? "

  //Check the username
  db.query(selectQuery, [req,body,name], (err,data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("User not found");

  //Check the password
  const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);

  if (!isPasswordCorrect) return res.status(400).json("Wrong username or password");

  const token = jwt.sign({ id: data[0].id }, "jwtkey");
  const { password, ...other } = data[0];

  res.cookie("access_token", token, {
        httpOnly: true,
      }).status(200).json(other);

  })
}

export const logout = (req: express.Request, res: express.Response) => {
  // Implement logout logic here
    res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
  }).status(200).json("User has been logged out.")
};
