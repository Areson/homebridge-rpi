// homebridge-rpi/lib/RpiService/Stateful/Slider.js
// Copyright © 2024 Ian Oberst.  All rights reserved.
//
// Homebridge plugin for Raspberry Pi.

import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate'
import { RpiService } from '../../RpiService.js'

class Slider extends ServiceDelegate {
    constructor (sliderAccessory, params = {}) {      
      params.name = sliderAccessory.name
      params.Service = sliderAccessory.Services.hap.Slider
      super(sliderAccessory, params)
      this.pi = sliderAccessory.pi
      this.params = params
      this.fileName = sliderAccessory.getStateFilePath('slider')
      
      this.maxValue = params.maxValue
      this.minValue = params.minValue
      this.minStep = params.minStep
      this.pad = ''
      const pad = `${this.maxValue}`
      for (let i = 0; i < pad.length; i++) {
        this.pad += ' '
      }

      this.addCharacteristicDelegate({
        key: 'slider',
        Characteristic: this.Characteristics.hap.SliderValue,
        value: this.minValue,
        props: {
            minValue: this.minValue,
            maxValue: this.maxValue,
            minStep: this.minStep 
        },
        setter: async (value) => {
            await this.pi.createAndWriteFile(this.fileName, `${value}${this.pad}`.substring(0, this.pad.length))
        }
      })

      this.addCharacteristicDelegate({
        key: 'statusFault',
        Characteristic: this.Characteristics.hap.StatusFault,
        silent: true
      })

    }
  
    async init() {
        await this.pi.createAndWriteFile(this.fileName, `${this.values.slider}${this.pad}`.substring(0, this.pad.length))
    }
    async shutdown() {}
    update (value) {}
  }

RpiService.Slider = Slider
