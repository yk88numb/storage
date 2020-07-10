function s3() {
    const AWS = require('aws-sdk');
    return new AWS.S3({
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    });
}

module.exports = s3