# crud-api

## Before starting

1. `npm install`
2. create `.env` and fill it with `PORT` value as in `.env.example`

## To start dev server

`npm run start:dev`

## To start prod server

`npm run start:prod`

## To run tests

`npm run test`

## To start multi server and test it

1. open terminal and run `npm run start:multi` (server logs will appear in this tab)
2. open another terminal from project root and run `./test-cluster.sh` (test logs will appear in this tab)

## Example calls to API

1. Get users: `curl http://localhost:4000/api/users`
2. Create user: `curl -X POST -H "Content-Type: application/json" -d '{"username":"John Doe","age":30,"hobbies":["reading","cycling"]}' http://localhost:4000/api/users`
3. Get user by id: `curl http://localhost:4000/api/users/1`
4. Update user by id: `curl -X PUT -H "Content-Type: application/json" -d '{"username":"John Updated","age":31,"hobbies":["reading","swimming"]}' http://localhost:4000/api/users/1`
5. Delete user by id: `curl -X DELETE http://localhost:4000/api/users/1`
