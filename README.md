# Test-Server : Express, Mongoose, Node API

## Summary
This is a project meant to be scaleable for future collections if ever needed. This API is meant to be a fake database for projects needed data, but endpoints are not currently available. I used www.mockaroo.com to create fake data, and this was a great resource, and very easy to use. This API is built with Node, Express, and Mongo. I have already developed a structure for GET, POST, PUT, and DELETE. When a new collection needs to be added, it will have to be added to the `mLab` database (however, I may make an endpoint to add collections externally, but that is further down the road.)

## Current collections
- transactions

### EndPoints
- GET /:collection - Returns all in that collection.
- GET /:collection/:id - Returns all documents within the collection that match that `_id`.
- POST /:collection - Inserts document in specified collection.
- PUT /:collection/:id - Updates document with that `_id`, and updates all attributes passed in the body.
- DELETE /:collection - Pass the document in the body of the request, but it must at lease include the `_id`.

## Getting Started

Clone the repo:
```sh
git clone git@github.com:DavidAshenfelder/test-server.git
cd test-server
```

Install dependencies for the API:
```sh
npm install
```

### Important - to run local
- You must have MongoDB installed globally, and have stared the DB by running
```sh
mongod
```
** MongoDB reference if you are not familiar https://scotch.io/tutorials/an-introduction-to-mongodb
*** IMPORTANT - if you are committing this to a repo `.gitignore` this file.
(you do not want to share these credentials with the world.)
- rename defaultConfig.js to config.js file in root directory
- Replace code with:
```
  database: process.env.MONGODB_URI || 'localhost/<your-local-MongoDB>',
```

Start server:
```sh
npm start
```

## Seeding Data
- Create `seed.json` file in root directory
*** IMPORTANT - if you are committing this to a repo `.gitignore` this file.
(you do not want to share these credentials with the world.)
- insert code
```
{
	"undefined": "localhost/<your-local-MongoDB>",
	"dev": "localhost/<your-local-MongoDB>",
  *** If you have prod you need to replace this with your mongo database info.
	"prod": "mongodb://<username>:<password>@ds<555555>.mlab.com:<55555>/your-mLabDatabase"
}
```
- Insert fake data into the `./seeds` directory, and name the file `<:collection>.json`.
- Run Command
```sh
seed
```
