# ScratchPad
Temporary file you can offload objects in to, with very fast performance to read them back later. Great for situations where you need to ingest a large amount of data out of order, look over it, and then read it back in a different order later. `npm i --save scratchpad`

```mjs
import ScratchPad from 'scratchpad'
// or const ScratchPad = require('scratchpad')

pad = await ScratchPad.create()
const read1 = await pad.write(someBigObject)
const read2 = await pad.write(otherBigDataObject)

// ... later
const structuredCloneOfotherBigDataObject = await read2()
const structuredCloneOfSomeBigObject = await read1()

pad.close() // free the memory, they can't be read now
```

Really simple API. It creates a temp file in /tmp or whatever, appends to it using v8 serialization which is lightning fast, and is a superset of JSON. Cyclic data structures are supported, as well as many more types than JSON. Look over the [HTML Structured Clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) to see what it can do.

Write in objects, read them back later in any order. It's much more performant than writing out objects to individual files, and uses less disk space too. The temporary file is immediately unlinked after it's opened, so if your process crashes, it wont leave a lingering temp file hanging around taking up space. As soon as your process finishes, or you call `pad.close()`, the disk space is freed.

I wrote this because sometimes I need to ingest a long stream of objects, but they might not be in the order I need them to be in. ScratchPad provides a way to consume a stream, and buffer in a very large amount of information, then once a full view of the situation is clear, the objects can be read back in to memory as needed in whatever order you want. Streams are great for mapping, but scratchpad is great for reducing those outputs.

SSDs are so fast now. You probably don't need more ram. Use ScratchPad. Get it done eventually. Keep your bucks in your pocket.

--<3 Phoenix

<p align=center><img alt="GitHub Actions Continuous Integration Status" src=https://github.com/Bluebie/scratchpad/actions/workflows/node.js.yml/badge.svg></p>