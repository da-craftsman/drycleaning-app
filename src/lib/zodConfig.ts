import { z } from 'zod'

// Zod otherwise probes for eval support with `new Function`, which the Content-Security-Policy
// reports as a violation. Its eval-based fast path isn't needed for forms this small. Zod reads
// this when each schema is defined, so main.tsx imports this module before anything else.
z.config({ jitless: true })
