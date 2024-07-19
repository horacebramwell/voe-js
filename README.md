# voe-js

A TypeScript/Node.js wrapper for the VOE API, providing methods to interact with VOE's services including account information, file uploads, and file management.

## Features

- Fetch account information and statistics
- Upload files to VOE
- Perform remote uploads
- Manage files (list, rename, move, delete)
- Clone uploads
- Fully typed with TypeScript
- Logging with Winston

## Installation

```bash
npm install voe-js
```

## Usage

### Initialize VOE

```typescript
import { VOE } from "voe-js"

const apiKey = "your_api_key"
const voe = new VOE(apiKey)
```

### Fetch Account Information

```typescript
async function getAccountInfo() {
  try {
    const info = await voe.getAccountInfo()
    console.log(info)
  } catch (error) {
    console.error(error)
  }
}

getAccountInfo()
```

### Fetch Account Statistics

```typescript
async function getAccountStats() {
  try {
    const stats = await voe.getAccountStats()
    console.log(stats)
  } catch (error) {
    console.error(error)
  }
}

getAccountStats()
```

### Get Upload Server URL

```typescript
async function getUploadServer() {
  try {
    const uploadServer = await voe.getUploadServer()
    console.log(uploadServer)
  } catch (error) {
    console.error(error)
  }
}

getUploadServer()
```

### Upload a File

```typescript
import fs from "fs"

async function uploadFile() {
  try {
    const uploadServer = await voe.getUploadServer()
    const file = fs.readFileSync("path/to/your/file")
    const result = await voe.uploadFile(uploadServer, file)
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}

uploadFile()
```

### Remote Upload

```typescript
async function remoteUpload() {
  try {
    const result = await voe.remoteUpload("https://example.com/file.mp4")
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}

remoteUpload()
```

### List Files

```typescript
async function listFiles() {
  try {
    const files = await voe.listFiles({ page: 1, per_page: 10 })
    console.log(files)
  } catch (error) {
    console.error(error)
  }
}

listFiles()
```

### Get File Info

```typescript
async function getFileInfo() {
  try {
    const fileInfo = await voe.getFileInfo("file_code_1,file_code_2")
    console.log(fileInfo)
  } catch (error) {
    console.error(error)
  }
}

getFileInfo()
```

### Rename a File

```typescript
async function renameFile() {
  try {
    const result = await voe.renameFile("file_code", "new_file_name")
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}

renameFile()
```

### Move a File

```typescript
async function moveFile() {
  try {
    const result = await voe.moveFile("file_code", 12345)
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}

moveFile()
```

### Delete a File

```typescript
async function deleteFile() {
  try {
    const result = await voe.deleteFile("file_code")
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}

deleteFile()
```

### Clone an Upload

```typescript
async function cloneUpload() {
  try {
    const result = await voe.cloneUpload("file_code", 0)
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}

cloneUpload()
```

### Custom Logger

You can pass a custom logger to the `VOE` constructor. The logger must implement `info`, `warn`, and `error` methods.

```typescript
import { VOE } from "voe-js"
import winston from "winston"

const apiKey = "your_api_key"
const customLogger = winston.createLogger({
  level: "debug",
  transports: [new winston.transports.Console()],
})

const voe = new VOE(apiKey, { logger: customLogger })
```

## Error Handling

The `VOE` class throws custom errors of type `VOEError` that include a `code` property and an optional `response` property if the error was due to an API request failure.

```typescript
import { VOE, VOEError } from "voe-js"

async function getAccountInfo() {
  try {
    const info = await voe.getAccountInfo()
    console.log(info)
  } catch (error) {
    if (error instanceof VOEError) {
      console.error(`Error Code: ${error.code}`)
      if (error.response) {
        console.error(`Status Code: ${error.response.status}`)
        console.error(`Response: ${JSON.stringify(error.response.data)}`)
      }
    } else {
      console.error(error)
    }
  }
}

getAccountInfo()
```

## License

MIT
