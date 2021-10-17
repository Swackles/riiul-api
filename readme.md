# Riiul API

This is the backend for the Riiul project

## Environment variables

This project uses few environment variables describled below

| name | type | description |
|---|---|---|
| NODE_ENV | development, production, test  | Used to define in what environment the application is running
| PORT | number | Used to set the PORT of the application, defaults to 8080

## Scripts

These are npm scripts used in this project

| name | description |
|---|---|
| build | Build the ts project into the /dist folder at project root
| start | Builds and starts the application
| test | Run all tests

## Tests

To run tests, use the `npm run test` command.

### How to add tests

Tests are added into the same directory as the file that is being tested. For jest to pick up tests, they must be added inside a `__tests__` folder and end with `.tests.ts`
