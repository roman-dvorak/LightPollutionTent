export default {
  nav: {
    intro: 'Introduction',
    city: 'Light Up the City',
    globe: 'Light Pollution Atlas',
  },
  intro: {
    title: 'Light Pollution',
    subtitle: 'How humanity lost the starry sky',
    bortle: 'The Bortle Scale',
    bortleDesc: 'Click a class to display it on the simulated sky',
    factsHint: 'Facts & figures',
    touchHint: 'Pictures react to mouse and finger movement; tap a card for details.',
  },
  city: {
    title: 'Light Up the City',
    subtitle: 'Place lights on the map and watch light pollution grow',
    addLight: 'Add light',
    reset: 'Reset',
    totalLP: 'Light pollution',
    bortle: 'Bortle',
    sendToStel: 'Show in sky',
    lights: {
      globe:           'Globe lamp',
      fullCutoff:      'Full cutoff',
      coldLED:         'Cold LED',
      pcAmber:         'PC Amber LED',
      floodlight:      'Floodlight',
      church:          'Lit church',
      house:           'House',
      badBillboard:    'Bad billboard',
      betterBillboard: 'Better billboard',
      darkBillboard:   'Dark billboard',
      cars:            'High-beam cars',
      astronomer:      'Astronomer',
    },
    lightDesc: {
      globe:           'Omnidirectional, high LP',
      fullCutoff:      'Downward only, low LP at any height',
      coldLED:         'Cold white LED, medium LP',
      pcAmber:         'Warm amber LED, low LP',
      floodlight:      'Floodlight, very high LP',
      church:          'Upward spotlights, extreme LP',
      house:           'Windows & exterior, low LP',
      badBillboard:    'Bottom-lit, high LP',
      betterBillboard: 'Top-lit, low LP',
      darkBillboard:   'No lighting, zero LP',
      cars:            'High beams, medium LP',
      astronomer:      'Red lamp, zero LP',
    },
    height: 'Height',
    maxReached: 'Element limit reached',
    remove: 'Click to remove',
    dragHint: 'Drag an item from the menu onto the sky; click a placed light to remove it.',
    soundOn: "Sound on",
    soundOff: "Sound off",
    centerSky: 'Center sky',
  },
  globe: {
    title: 'Light Pollution Atlas',
    subtitle: 'Click on the globe to display the light pollution level',
    clickHint: 'Click anywhere on the globe',
    location: 'Location',
    zone: 'Zone',
    bortleIndex: 'Bortle index',
    sendToStel: 'Show in sky',
    lat: 'Latitude',
    lon: 'Longitude',
  },
  about: {
    button: 'About',
    title: 'About',
    body: `<b>Light Up the City, Dim the Sky</b> is an interactive web application that visually demonstrates the impact of light pollution on the night sky.

Users place different types of street lamps, floodlights, and other light sources onto a nocturnal city panorama and watch in real time as the sky brightness changes, from a naturally dark sky (Bortle 1) to an over-lit urban sky (Bortle 9).

Clicking on the Bortle scale or placing lights instantly shows the current pollution level on the simulated sky.

The goal of the project is to raise awareness about light pollution and show that properly designed lighting can significantly reduce its impact without sacrificing the safety and comfort that artificial light provides.

The project was created in 2026 for the Science Fair (Veletrh vědy) and is still being developed.`,
    credit: 'Made by\nRoman Dvořák',
  },
  stel: {
    sending: 'Updating sky…',
    ok: 'Sky updated',
    error: 'Error communicating with Stellarium',
  },
}
