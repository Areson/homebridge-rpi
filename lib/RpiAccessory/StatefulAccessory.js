// homebridge-rpi/lib/RpiAccessory/StatefulAccessory.js
// Copyright © 2024-2026 Ian Oberst. All rights reserved.
//
// A "stateful" device is a HomeKit control whose value is stored in a file on
// the remote Pi (under /etc/homebridge-rpi/stateful) instead of driving a GPIO.
// Fork-only file.  It also attaches addSlider() to RpiAccessory from here, so
// that upstream's RpiAccessory.js stays byte-identical.

import { AccessoryDelegate } from 'homebridge-lib/AccessoryDelegate'

import { RpiAccessory } from '../RpiAccessory.js'
import { RpiService } from '../RpiService.js'
import '../RpiService/Stateful/Slider.js'

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

  /** Path of the state file on the remote Pi, e.g. .../slider_FogDurationSeconds */
  getStateFilePath (deviceType) {
    return `${filePath}/${deviceType}_${this.deviceName.replace(/\s/g, '')}`
  }
}

RpiAccessory.StatefulAccessory = StatefulAccessory

RpiAccessory.prototype.createStatefulAccessory = async function (device) {
  const statefulAccessory = new StatefulAccessory(this, device)
  // Keyed by name (there is no GPIO); each slider needs its own entry so
  // RpiAccessory.init()/shutdown() reach all of them.
  this.gpioAccessories[this.id + '-' + device.name] = statefulAccessory
  return statefulAccessory
}

RpiAccessory.prototype.addSlider = async function (device) {
  const statefulAccessory = await this.createStatefulAccessory(device)
  statefulAccessory.service = new RpiService.Slider(statefulAccessory, device)
  setImmediate(() => { statefulAccessory.emit('initialised') })
}

export { StatefulAccessory }
