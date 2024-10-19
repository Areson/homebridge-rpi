// homebridge-rpi/lib/RpiAccessory/StatefulAccessory.js
// Copyright © 2024 Ian Oberst.  All rights reserved.
//
// Homebridge plugin for Raspberry Pi.

import { AccessoryDelegate } from 'homebridge-lib/AccessoryDelegate'

import { RpiAccessory } from '../RpiAccessory.js'

const filePath = '/etc/homebridge-rpi/stateful'

class StatefulAccessory extends AccessoryDelegate {
  constructor (rpiAccessory, device) {
    const params = {
      name: device.name,
      id: rpiAccessory.id + '-' + device.name,
      manufacturer: 'homebridge-rpi',
      model: device.device[0].toUpperCase() + device.device.slice(1),
      category: rpiAccessory.Accessory.Categories.Other
    }
    super(rpiAccessory.platform, params)
    this.id = rpiAccessory.id + '-' + device.name
    this.rpiAccessory = rpiAccessory
    this.pi = rpiAccessory.pi
    this.deviceName = device.name
    this.inheritLogLevel(rpiAccessory)
  }

  async init () {
    return this.service.init()
  }

  setFault (fault) {
    this.service.values.statusFault = fault
      ? this.Characteristics.hap.StatusFault.GENERAL_FAULT
      : this.Characteristics.hap.StatusFault.NO_FAULT
  }

  async shutdown () {
    return this.service.shutdown()
  }

  getStateFilePath (deviceType) {
    return `${filePath}/${deviceType}_${this.deviceName.replace(/\s/g, '')}`
  }
}

RpiAccessory.StatefulAccessory = StatefulAccessory
