# add node bin script path for recipes
export PATH := "./node_modules/.bin:" + env_var('PATH')

# Default: display available recipes
_help:
    @just --list

# –––––––––––––----------------------------------------------------------------
# Setup
# –––––––––––––----------------------------------------------------------------

# Set up the dev environment on a MacOS or GNU/Linux system
setup-dev-env:
    scripts/setup-dev-env

# Install node modules afresh
install *params: clean
    npm install {{params}}

# Clean up dist and node modules
clean:
    rm -rf dist
    rm -rf node_modules

# Install node modules strictly as specified (typically for CI)
install-stable:
    npm ci

# Compile code to dist for dev (with source maps)
compile-dev:
    babel src/ --out-dir=dist --source-maps both

# Compile code to dist for dev, then watch and recompile on changes
compile-watch:
    babel src/ --verbose --watch --out-dir=dist --source-maps both

# Compile code to dist for release
compile-release:
    babel src/ --out-dir=dist

# –––––––––––––----------------------------------------------------------------
# Run
# –––––––––––––----------------------------------------------------------------

# Start the server
start:
    NODE_ENV=development babel-node src/server.js

# –––––––––––––----------------------------------------------------------------
# Test & related
# –––––––––––––----------------------------------------------------------------

# Run tests with optional extra parameters
test *params:
    NODE_ENV=test mocha {{params}}

# Run tests with detailed output
test-detailed *params:
    NODE_ENV=test mocha --reporter=spec {{params}}

# Run tests with detailed output for debugging
test-debug *params:
    NODE_ENV=test mocha --timeout 3600000 --reporter=spec --inspect-brk=40000 {{params}}

# Run tests and generate HTML coverage report
test-cover component *params:
    NODE_ENV=test nyc --reporter=html --report-dir=./coverage mocha {{params}}

# –––––––––––––----------------------------------------------------------------
# Misc. utils
# –––––––––––––----------------------------------------------------------------

# Generate Flow.js coverage report
flow-cover:
    flow-coverage-report -i 'components/**/*.js' -t html

# Run source licensing tool (see 'licensing' folder for details)
license:
    source-licenser --config-file .licenser.yml ./
