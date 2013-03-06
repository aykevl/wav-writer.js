
# WAVE file writer

This library/function takes one [AudioBuffer](http://www.w3.org/TR/webaudio/#AudioBuffer) and returns one [ArrayBuffer](https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/ArrayBuffer) (of the type [Int16Array](https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/Int16Array). It is designed to work with the [Web Audio API](http://www.w3.org/TR/webaudio/).

Audio data is written as 16-bit PCM data, with the amount of channels from the input (usually two, stereo) and the sample rate of the input (often 48000khz).

Including is simple (just as you would expect):
```html
<script src="wav-writer.js"></script>
```

Converting is also simple:
```js
arraybuffer = buffer2wav(audiobuffer);
```

You may want to do this conversion in a [Web Worker](https://developer.mozilla.org/en-US/docs/DOM/Using_web_workers), as conversion may take a few seconds (with long audio), or otherwise at least lock up the UI for a short while.
