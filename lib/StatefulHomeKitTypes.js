// homebridge-rpi/lib/StatefulHomeKitTypes.js
// Copyright © 2024-2026 Ian Oberst. All rights reserved.
//
// Custom HomeKit types for the stateful (slider) devices.
// Fork-only file: upstream never touches it, so rebases stay clean.
// The UUIDs are the ones the sliders have used since 2024; changing them
// would make HomeKit see new characteristics.

import { CustomHomeKitTypes } from 'homebridge-lib/CustomHomeKitTypes'

let instance = null

class StatefulHomeKitTypes extends CustomHomeKitTypes {
  constructor (homebridge) {
    super(homebridge)

    this.createCharacteristicClass(
      'SliderValue', '38AFD9A5-A0C5-42D9-ACD0-1BE08D4FF3F7', {
        format: this.Formats.INT,
        perms: [this.Perms.PAIRED_READ, this.Perms.PAIRED_WRITE, this.Perms.NOTIFY]
      }, 'Value'
    )

    this.createServiceClass(
      'Slider', 'DDFC25B3-3624-44CA-9477-FDC977FC7C81', [
        this.Characteristics.SliderValue
      ], [
        this.hapCharacteristics.On,
        this.hapCharacteristics.StatusFault
      ]
    )
  }
}

/** Create the types once, before the platform is loaded (called from index.js). */
function initStatefulTypes (homebridge) {
  if (instance == null) {
    instance = new StatefulHomeKitTypes(homebridge)
  }
  return instance
}

/** The shared instance, for the service and accessory delegates. */
function statefulTypes () {
  if (instance == null) {
    throw new Error('StatefulHomeKitTypes not initialised')
  }
  return instance
}

export { StatefulHomeKitTypes, initStatefulTypes, statefulTypes }
