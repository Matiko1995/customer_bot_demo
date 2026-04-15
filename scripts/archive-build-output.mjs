#!/usr/bin/env node

import { createBuildArchive } from './archive-build-output-lib.mjs'

console.log(JSON.stringify(createBuildArchive(), null, 2))
