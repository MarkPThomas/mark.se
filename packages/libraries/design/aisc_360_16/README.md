# GeoJSON
GeoJSON is a wrapper library that makes it easy to store, access, manipulate, and update GeoJSON objects as immutable entities. It also has convenience features, such as tolerance limits & validations for Geometries.

## Documentation
See the [Project Wiki](https://markpthomas.github.io/wiki/GeoJSON_52559930.html) for topics like:
- Complete product description
- Demos
- How-to articles
- API documentation
- Algorithms, diagrams, and other development documentation

## Testing
There is one type of test run (unit), which is run in two different environments (default, and dev). Dev environments run tests from within a running container.

Unit tests for a given file are located in a separate testing file at the same directory location as the tested file.

Test files are designated by the following format `{fileTested}.[u]spec.ts`.

### Unit Tests
Unit tests should mock any and all calls to database repos or calls to other services. Unit tests are typically designated by `u`, if designated at all.

Filename: \
  `{fileTested}.spec.ts`

Commands:
* `yarn test:u`         - Runs all unit tests directly
* `yarn test:u:dev`     - Runs all unit tests within a container environment
* `make run_unit_tests` - Runs all unit tests within a container environment