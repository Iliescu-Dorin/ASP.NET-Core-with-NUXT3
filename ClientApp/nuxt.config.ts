import { defineNuxtConfig } from 'nuxt'
import fs from 'fs'
import * as defaults from "./src/aspnetcore-nuxt"
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    script: './node_modules/nuxt/bin/nuxt.js',
    devServer: {
        https: {
            cert: fs.readFileSync(defaults.certFilePath),
            key: fs.readFileSync(defaults.keyFilePath)
        },
        proxy: defaults.PROXY_CONFIG
    }
})