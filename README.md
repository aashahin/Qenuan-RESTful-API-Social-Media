# **Qenuan - RESTful Api for social media like twitter**

## Tech Stack

**Server:** Node, Express, MongoDB, Mongoose, JWT

**Modules:** nodemailer, bcryptjs,express-validator,multer,sharp,helmet,hpp,compression,hpp,toobusy-js,xss-clean

# API FEATURES

- Authentication & Authorization
- CRUD operations
- Users, Posts, Likes, Followers, Hashs, Comments
- Profile
- Upload photos for cloudinary
- improve images
- Log out if the password is changed
- Permissions (Admin,vendor,user)
- Block Users
- Verify Rest Code on email
- Forget Password
- More to explore!

## Run Locally

Clone the project

```bash
  git clone https://github.com/aashahin/Qenuan-RESTful-API-Social-Media-Node.js.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## Environment Variables

To run this project, you will need to add the following environment variables to your config.env file

# Server Settings
```
PORT=5000

NODE_ENV=development

BASE_URL=https://example.com
```
# Database
```
MONGO_URL=mongodb://localhost:0000/ecommerces
```
# JWT
```
SECRET_KEY='as#ewronh$%@65*-'
EXPIRESIN=90d
```
# Email
## -Settings
```
HOST_MAIL="smtp.example.com"
PORT_MAIL=465
SECURE_MAIL=true
USER_MAIL="support@example.com"
PASSWORD_MAIL="password"
```
## -Message
```
 FROM_MAIL="Shaheen Team <abdelrahman@shaheen.com>"
```
## Cloudinary
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
# API Authentication

Some endpoints may require authentication for example. To create a create/delete/update, you need to register your API client and obtain an access token.

The endpoints that require authentication expect a bearer token sent in the `Authorization header`.

**Example**:

`Authorization: Bearer YOUR TOKEN`

## Register a new API client

```http
POST /api/v1/user/signup
```

The request body needs to be in JSON format.

# **Examples**

## **User Login**

```http
POST /api/v1/user/login
```

| Parameter        | Type     | Description   | Required |
| :--------------- | :------- | :------------ | :------- |
| `authentication` | `string` | Your token    | no       |
| `email`          | `string` | Your email    | yes      |
| `password`       | `string` | Your password | yes      |


## **Info loggged user**

```http
GET /api/v1/user/info
```

| Parameter        | Type     | Description | Required |
| :--------------- | :------- | :---------- | :------- |
| `authentication` | `string` | Your token  | yes      |

## **Get Profile**

```http
GET /api/v1/user/:id
```

| Parameter        | Type     | Description | Required |
| :--------------- | :------- | :---------- | :------- |
| `authentication` | `string` | Your token  | yes       |

## **[View on Postman](https://www.postman.com/orbital-module-geologist-396425/workspace/myapis/collection/19652608-55248f9a-d69b-4689-b263-7da9daae6a36?action=share&creator=19652608)**

[![Logo](https://pub-ebc3292441104a07b54e254192a1b246.r2.dev/icons8-postman-is-the-only-complete-api-development-environment-96.png)](https://www.postman.com/orbital-module-geologist-396425/workspace/myapis/collection/19652608-30abf040-9f6d-45f8-b45b-9bdd6a7a4a56?action=share&creator=19652608)
