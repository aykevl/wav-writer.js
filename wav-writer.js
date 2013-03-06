'use strict';

// whoa - let's do WAV encoding in JavaScript!
// See http://www.sk89q.com/playground/jswav/
// and https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
// Input is one AudioBuffer object
// Output is 16 bit PCM, with the amount of channels of the input (tested
// with two channels).
// This function only works on little-endian OSes, unfortunately, due to the
// design of ArrayBufferView.
// WARNING: this is NOT a lossless conversion, unfortunately. Bits keep being
// changed, somehow. Probably somewhere in the float -> int conversion.
// At least, it does in some samples, other samples seem to be completely equal.
function buffer2wav (buffer) {

	/* define a few helper functios */

	// dump binary data
	function xxd (buffer) {
		for (var i=0; i<buffer.length; i+=8) {
			var line = '';
			for (var j=i; j<Math.min(i+8, buffer.length); j+=1) {
				var n = buffer[j];
				// to big-endian (?)
				n = ((n & 0xff) << 8) + (n >> 8);
				var c = n.toString(16);
				while (c.length < 4) c = '0' + c;
				line += c + ' ';
			}
			var linenr = (i*2).toString(16);
			while (linenr.length < 4) linenr = '0' + linenr;
			console.log(linenr+':', line);

			if (i >= 32) break;
		}
	}

	// big endian 32bit int to binary
	function be_pack32 (index, n) {
		// biggest two bytes in input
		be_pack16(index,   n >> 16);
		// smallest two bytes in input
		be_pack16(index+1, n & 0xffff);
		// all bytes are now swapped (position 1=4, 2=3, 3=2, 4=1)
	}

	// big endian 16bit int to binary
	function be_pack16 (index, n) {
		// swap bytes
		wav[index] = (n & 255) * 256  +  ((n >> 8) & 255)
	}

	function le_pack32 (index, n) {
		wav[index]   = n & 0xffff;
		wav[index+1] = n >> 16;
	}

	function le_pack16 (index, n) {
		wav[index] = n; // easy
	}


	/* actual writeout */


	// see https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
	// for an explanation
	var bitsPerSample   = 16; // 16 bit sound
	var numChannels     = buffer.numberOfChannels;
	var sampleRate      = buffer.sampleRate;
	var numSamples      = buffer.length;

	var byteRange       = sampleRate * numChannels * bitsPerSample/8;
	var blockAlign      = numChannels * bitsPerSample/8;
	var subchunk1Size   = 16; // 16 for PCM
	var subchunk2Size   = numSamples * numChannels * bitsPerSample/8;
	var chunkSize       = 4 + (8 + subchunk1Size) + (8 + subchunk2Size);
	var fileSize        = chunkSize + 8; // 8 bytes for the header+size

	var wav = new Int16Array(fileSize/2);

	// write header
	be_pack32(0,  0x52494646); // "RIFF"
	le_pack32(2,  chunkSize);
	be_pack32(4,  0x57415645); // "WAVE"

	// format chunk ('fmt')
	be_pack32(6,  0x666d7420); // "fmt "
	le_pack32(8,  subchunk1Size);
	le_pack16(10, 1); // indicates file type. 1 for PCM audio data
	le_pack16(11, numChannels);
	le_pack32(12, sampleRate);
	le_pack32(14, byteRange);
	le_pack16(16, blockAlign);
	le_pack16(17, bitsPerSample);

	// data chunk header
	be_pack32(18, 0x64617461); // "data"
	le_pack32(20, subchunk2Size);

	var position = 22; // start writing at 44th byte

	// actually write out the audio data
	for (var chan=0; chan<numChannels; chan++) {
		var channel = buffer.getChannelData(chan);
		for (var i=0*channel.length/2; i<channel.length; i++) {
			// WARNING: this is NOT a lossless conversion
			// There keep being small differences that I can't seem to fix
			wav[position + i*2 + chan] = (channel[i] * 32768);
		}
	}

	return wav;
}

// compare two ArrayBufferViews and show the differences
function wavwriter_cmp (buf1, buf2) {
	var diffs = [];
	if (buf1.length != buf2.length) throw 'invalid';

	for (var i=0; i<buf1.length; i++) {
		if (buf1[i] != buf2[i]) {
			diffs.push(buf1[i].toString(16)+' '+buf2[i].toString(16));
		}
	}
	console.log('differences:', diffs.length, diffs);
}
