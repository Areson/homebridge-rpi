const regExps = {
    uuid: /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
    uuidPrefix: /^[0-9A-F]{1,8}$/,
    uuidSuffix: /^-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/
  }

function registerWith(api) {
    const Characteristic = api.hap.Characteristic;
    const Service = api.hap.Service;

    const createCharacteristicClass = function(key, uuid, props, displayName = key) {
        if (typeof key !== 'string') {
          throw new TypeError('key: not a string')
        }
        if (key === '') {
          throw new RangeError('key: invalid empty string')
        }
        if (Characteristic[key] != null) {
          throw new SyntaxError(`${key}: duplicate key`)
        }
        if (!regExps.uuid.test(uuid)) {
          throw new RangeError(`uuid: ${uuid}: invalid UUID`)
        }
    
        Characteristic[key] = class extends Characteristic {
          constructor () {
            super(displayName, uuid)
            this.setProps(props)
            this.value = this.getDefaultValue()
          }
        }
        Characteristic[key].UUID = uuid
        return Characteristic[key]
      }

      const createServiceClass = function(key, uuid, Characteristics, OptionalCharacteristics = []) {
        if (typeof key !== 'string') {
          throw new TypeError('key: not a string')
        }
        if (key === '') {
          throw new RangeError('key: invalid empty string')
        }
        if (Service[key] != null) {
          throw new SyntaxError(`${key}: duplicate key`)
        }
        if (!regExps.uuid.test(uuid)) {
          throw new RangeError(`uuid: ${uuid}: invalid UUID`)
        }
    
        Service[key] = class extends Service {
          constructor (displayName, subtype) {
            super(displayName, uuid, subtype)
            for (const Characteristic of Characteristics) {
              this.addCharacteristic(Characteristic)
            }
            for (const Characteristic of OptionalCharacteristics) {
              this.addOptionalCharacteristic(Characteristic)
            }
          }
        }
        Service[key].UUID = uuid
        return Service[key]
    }
      

    /******************************************************
     * Slider switch
     */

    createCharacteristicClass('SliderValue', '38AFD9A5-A0C5-42D9-ACD0-1BE08D4FF3F7', {
        format: api.hap.Characteristic.Formats.INT,
        perms: [api.hap.Characteristic.Perms.READ, api.hap.Characteristic.Perms.WRITE],
      }, "Value");    


    createServiceClass('Slider', 'DDFC25B3-3624-44CA-9477-FDC977FC7C81', [
        Characteristic.SliderValue
    ], [Characteristic.On]);        
  };

export { registerWith };
