<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

Backend for uploading file in chunks to effectively upload large files.

## Tools Used

1. **NestJS**: A powerful Node.js framework used for building scalable and efficient server-side applications.

2. **ioredis**: A Redis client library for Node.js, used for connecting to and interacting with Redis.

3. **multer**: Middleware for handling file uploads in Express applications.

4. **express**: A web application framework for Node.js used as a foundation for building RESTful APIs.

5. **uuid**: A library for generating unique identifiers (UUIDs).

## RedisService

### Description
This service provides methods to interact with a Redis database. It includes functionality for setting and getting values, managing hashes, checking the existence of keys, and removing hash items.

### Methods

1. `setValue(key: string, value: string)`
   - Sets a key-value pair in Redis.
   
2. `getValue(key: string): Promise<string | null>`
   - Retrieves the value associated with a given key from Redis.

3. `setHashItem(hashKey: string, field: string, value: string)`
   - Sets a field and its value in a Redis hash.

4. `getHash(hashKey: string): Promise<Record<string, string>>`
   - Retrieves all field-value pairs from a Redis hash.

5. `getHashItem(hashKey: string, field: string): Promise<string | null>`
   - Retrieves the value of a specific field in a Redis hash.

6. `isKeyExist(hashKey: string, searchKey: string): Promise<boolean>`
   - Checks if a specific key exists within a Redis hash.

7. `removeHashItem(hashKey: string, field: string)`
   - Removes a specific field from a Redis hash.

## UploadService

### Description
This service provides functionality for processing and storing uploaded files. It reads file content, writes it to a destination, and supports the append mode for resumable uploads.

### Methods

1. `processFile(chunkPath: string, finalFilePath: string, startByte: number)`
   - Reads the content of a file chunk, appends it to a destination file, and removes the chunk file.

## UploadController

### Description
The controller handles HTTP requests related to file uploads. It uses the `FileInterceptor` from `multer` to handle file uploads, supports resumable uploads with partial content requests, and interacts with the `RedisService` and `UploadService` for managing file uploads.

### Endpoints

1. `POST /upload/file`
   - Description: Upload a file, supports resumable uploads.
   - Request Headers:
     - `Content-Range`: Indicates the byte range of the uploaded chunk.
     - `X-File-Identifier`: Unique identifier for the uploaded file.
   - Request Body:
     - `file`: The uploaded file.
   - Response:
     - Status Code: `206 Partial Content` (for partial uploads)
     - JSON Response:
       ```
       {
         "message": "Partial upload successful",
         "startByte": <startByte>,
         "endByte": <endByte>
       }
       ```
     - Description: Uploads a file chunk, appends it to the destination file, and updates Redis storage for resumable uploads. The response provides information about the uploaded chunk's start and end bytes.

## Additional Notes

- This documentation provides an overview of the key components and API endpoints of the backend project. Ensure that the necessary dependencies are installed, and the project configuration is set up before using these services and endpoints.
- Proper error handling and validation should be implemented in a production environment.
- Resumable uploads are supported using the `Content-Range` header, enabling large file uploads to be split into chunks and uploaded incrementally. The server appends the chunks to create the final file.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## License

Project is [MIT licensed](https://github.com/AhmedMaherHosny/file-upload-backend/blob/master/LICENSE).
