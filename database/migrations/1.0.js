"use strict";
const Promise = require("bluebird");
const sqlite3 = require("sqlite3");
const path = require('path');

module.exports = {
    up: function() {
      return new Promise(function(resolve, reject) {
        /* Here we write our migration function */
        let db = new sqlite3.Database('./database/ehealthApp.db');
        //   enabling foreign key constraints on sqlite db
        db.run(`PRAGMA foreign_keys = ON`);
        db.serialize(function() {
            db.run(`CREATE TABLE users (
              id INTEGER PRIMARY KEY,
              name TEXT,
              email TEXT,
              company_name TEXT,
              original_pattern TEXT,
              password TEXT
            )`);
      
            db.run(`CREATE TABLE patterns (
              id INTEGER PRIMARY KEY,
              compare_pattern TEXT,
              user_id INTEGER,
              net_score NUMERIC,
              FOREIGN KEY(user_id) REFERENCES users(id)
            )`);
      

          });
          db.close();
        });
      },
    down: function() {
        return new Promise(function(resolve, reject) {
          /* This runs if we decide to rollback. In that case we must revert the `up` function and bring our database to it's initial state */
          let db = new sqlite3.Database("./database/ehealthApp.db");
          db.serialize(function() {
            db.run(`DROP TABLE patterns`);
            db.run(`DROP TABLE users`);
          });
          db.close();
        });
      }
    };