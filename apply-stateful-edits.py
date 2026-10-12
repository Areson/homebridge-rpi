#!/usr/bin/env python3
"""Apply the fork's edits to upstream homebridge-rpi files (index.js,
lib/RpiPlatform.js, config.schema.json).  Run from the repo root after
checking out the upstream tag.  Every edit is an exact-string insert, so a
failure means upstream changed the anchor and the edit needs a look.

The new files (StatefulHomeKitTypes.js, StatefulAccessory.js, Slider.js)
are copied in separately; this script only touches upstream files.
"""
import io
import sys

def edit(path, anchor, insert, before=False, count=1):
    s = io.open(path, encoding="utf-8").read()
    if s.count(anchor) != count:
        sys.exit(f"{path}: anchor found {s.count(anchor)}x, expected {count}: {anchor[:60]!r}")
    new = (insert + anchor) if before else (anchor + insert)
    io.open(path, "w", encoding="utf-8", newline="\n").write(s.replace(anchor, new))
    print(f"edited {path}")

# ---- index.js: create the custom HomeKit types before the platform loads
edit("index.js",
     "import { RpiPlatform } from './lib/RpiPlatform.js'\n",
     "import { initStatefulTypes } from './lib/StatefulHomeKitTypes.js'\n")
edit("index.js",
     "function main (homebridge) {\n",
     "  initStatefulTypes(homebridge)\n")

# ---- lib/RpiPlatform.js: config validation for device "slider"
edit("lib/RpiPlatform.js",
     "            case 'fanshim':\n              break\n",
     "            case 'slider':\n"
     "              mandatoryKeys.push('minValue', 'maxValue', 'minStep')\n"
     "              parser.intKey('minValue')\n"
     "              parser.intKey('maxValue')\n"
     "              parser.intKey('minStep', 1)\n"
     "              break\n",
     before=True)
edit("lib/RpiPlatform.js",
     "          if (result.device === 'ds18b20') {\n",
     "          if (result.device === 'slider' && result.minValue >= result.maxValue) {\n"
     "            this.warn(\n"
     "              'config.json: hosts[%d]: devices[%d]: minValue must be less than maxValue',\n"
     "              i, j\n"
     "            )\n"
     "            continue\n"
     "          }\n",
     before=True)

# ---- lib/RpiPlatform.js: create the accessory
edit("lib/RpiPlatform.js",
     "            case 'valve':\n              await rpiAccessory.addValve(device)\n              break\n",
     "            case 'slider':\n"
     "              if (RpiAccessory.StatefulAccessory == null) {\n"
     "                await import('./RpiAccessory/StatefulAccessory.js')\n"
     "              }\n"
     "              await rpiAccessory.addSlider(device)\n"
     "              break\n")

# ---- config.schema.json: keep the sliders in the same UI form as the switches
edit("config.schema.json",
     '                      { "title": "Switch", "enum": ["switch"] },\n',
     '                      { "title": "Stateful Slider", "enum": ["slider"] },\n',
     before=True)
edit("config.schema.json",
     '                  "id": {\n                    "title": "ID",\n',
     '                  "minValue": {\n'
     '                    "title": "Minimum Value",\n'
     '                    "description": "Lowest slider value.<br>For device: Stateful Slider.",\n'
     '                    "type": "integer",\n'
     '                    "condition": {\n'
     '                      "functionBody": "return [\'slider\'].includes(model.hosts[arrayIndices[0]].devices[arrayIndices[1]].device)"\n'
     '                    }\n'
     '                  },\n'
     '                  "maxValue": {\n'
     '                    "title": "Maximum Value",\n'
     '                    "description": "Highest slider value.<br>For device: Stateful Slider.",\n'
     '                    "type": "integer",\n'
     '                    "condition": {\n'
     '                      "functionBody": "return [\'slider\'].includes(model.hosts[arrayIndices[0]].devices[arrayIndices[1]].device)"\n'
     '                    }\n'
     '                  },\n'
     '                  "minStep": {\n'
     '                    "title": "Minimum Step",\n'
     '                    "description": "Smallest change of the slider.<br>For device: Stateful Slider.",\n'
     '                    "type": "integer",\n'
     '                    "minimum": 1,\n'
     '                    "condition": {\n'
     '                      "functionBody": "return [\'slider\'].includes(model.hosts[arrayIndices[0]].devices[arrayIndices[1]].device)"\n'
     '                    }\n'
     '                  },\n',
     before=True)
edit("config.schema.json",
     '                  {\n                    "properties": {\n                      "device": { "enum": ["ds18b20"] }\n                    },\n                    "required": ["id"]\n                  }\n',
     ',\n                  {\n                    "properties": {\n                      "device": { "enum": ["slider"] }\n                    },\n                    "required": ["minValue", "maxValue", "minStep"]\n                  }\n')
print("all edits applied")
