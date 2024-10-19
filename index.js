// homebridge-rpi/index.js
// Copyright © 2019-2025 Erik Baauw. All rights reserved.
//
// Homebridge plugin for Raspberry Pi.

import { createRequire } from 'node:module'

import { RpiPlatform } from './lib/RpiPlatform.js'

import { registerWith } from './lib/HomeKitTypes.js'

const require = createRequire(import.meta.url)
const packageJson = require('./package.json')

function main (homebridge) {
  registerWith(homebridge)
  RpiPlatform.loadPlatform(homebridge, packageJson, 'RPi', RpiPlatform)
}

export { main as default }
