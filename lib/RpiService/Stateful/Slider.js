// homebridge-rpi/lib/RpiService/Stateful/Slider.js
// Copyright © 2024-2026 Ian Oberst. All rights reserved.
//
// A HomeKit slider whose value is written to a text file on the remote Pi
// through pigpiod's file commands.  The remote script reads the file.
// Fork-only file.

import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate'

import { RpiService } from '../../RpiService.js'
import { statefulTypes } from '../../StatefulHomeKitTypes.js'

/** Write text to a file on the remote Pi.  Creates the file if needed.
  * pigpiod only allows paths listed in /opt/pigpio/access on that Pi.
  * Needs the pigpio client (host port 8888); rgpiod has no file commands.
  */
async function writeRemoteFile (pi, filename, text) {
  const commands = pi.commands
  if (commands == null || commands.FO == null) {
    throw new Error('slider devices need a pigpiod connection (port 8888)')
  }
  const handle = (await pi.command(commands.FO, 2 | 8, 0, filename)).status
  try {
    await pi.command(commands.FW, handle, 0, text)
  } finally {
    await pi.command(commands.FC, handle)
  }
}

class Slider extends ServiceDelegate {
  constructor (statefulAccessory, device) {
    if (device.minValue >= device.maxValue) {
      throw new RangeError('minValue must be less than maxValue')
    }
    const types = statefulTypes()
    super(statefulAccessory, {
      name: statefulAccessory.name,
      Service: types.Services.Slider
    })
    this.pi = statefulAccessory.pi
    this.fileName = statefulAccessory.getStateFilePath('slider')
    this.minValue = device.minValue
    this.maxValue = device.maxValue
    this.minStep = device.minStep
    // The file always has as many characters as maxValue has digits,
    // so a shorter value overwrites a longer one completely.
    this.width = `${this.maxValue}`.length

    this.addCharacteristicDelegate({
      key: 'slider',
      Characteristic: types.Characteristics.SliderValue,
      value: this.minValue,
      props: {
        minValue: this.minValue,
        maxValue: this.maxValue,
        minStep: this.minStep
      },
      setter: async (value) => { await this.writeValue(value) }
    })

    this.addCharacteristicDelegate({
      key: 'statusFault',
      Characteristic: this.Characteristics.hap.StatusFault,
      silent: true
    })
  }

  async writeValue (value) {
    await writeRemoteFile(this.pi, this.fileName, `${value}`.padEnd(this.width))
  }

  /** Called when the Pi (re)connects: push the remembered value to the file. */
  async init () {
    await this.writeValue(this.values.slider)
  }

  async shutdown () {}

  update () {}
}

RpiService.Slider = Slider

export { Slider }
