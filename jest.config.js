const dotenv = require("dotenv")
dotenv.config({
    path: ".env.development"
})

const nextJest = require("next/Jest")

const createJestConfig = nextJest({
    dir: ".",
})
const jestConfig = createJestConfig({
    moduleDirectories: ["node_modules", "<rootDir>"],
})

module.exports = jestConfig