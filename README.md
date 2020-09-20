# Devpost typingdna challenge - eHealth App

## About
[Typingdna](https://www.typingdna.com/) is an innovative biometric algorithm based on the way you type. Typingdna is organizing a [hackathon on devpost](https://typingdna.devpost.com/). This is an entry for that hackathon.

Dermatomyositis is an uncommon disease characterized by muscle weakness and a skin rash. The condition can affect adults and children. The condition can wax and wane in severity. The treatment needs to be adjusted accordingly. I believe (this is just a hypothesis) that the typing pattern may change based on activity.

## What it does

This is a simple POC application that records the typing pattern on registration and subsequently monitors the pattern on every login and plots the similarity using the typingdna API. Ideally, this can be integrated with personal health records (PHR)

## Stack
* Express
* Sqlite
* Chartjs

## How to use

* *git clone* this repo
* *npm install*
* copy .env.sample to .env and add API credentials
* touch database/ehealthApp.db
* node scripts/migrate.js 
* *npm start*
* Access at http://localhost:8085

## Disclaimer

This is just a proof of concept and does not claim suitability for any clinical task.

## Contributor
[Bell Eapen](https://nuchange.ca)