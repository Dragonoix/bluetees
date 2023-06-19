const express = require('express');
const routeLabel = require('route-label');
const router = express.Router();
const namedRouter = routeLabel(router);
const golfCourseImageController = require('webservice/blue_tees/golf_course_image.controller');
const config = require(appRoot + '/config/index')
const aws = require('aws-sdk');
aws.config.update(config.aws);
const s3 = new aws.S3();
const multerS3 = require('multer-s3');
const multer = require('multer');

const uploadFile = multer({
  storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: config.aws.bucket,
      //contentType: multerS3.AUTO_CONTENT_TYPE,
      contentType: function (req, file, cb) {
          cb(null, file.mimetype);
      }, 
      metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        var mimeType = file.mimetype.split("/");
        var ext = mimeType[1];
        //cb(null, 'bluetees-app/'+file.fieldname + "_" + file.originalname.replace(/\s/g, '_'));
        cb(null, 'bluetees-app/'+file.fieldname + "_" +req.body.courseId + "_" +req.body.theme + "." + ext)
      }
  })
})

const request_param = multer();

namedRouter.all('/golfcourse*', auth.authenticateAPI);


namedRouter.post("api.bluetees.golfcourseimage.create", '/golfcourseimage/create',uploadFile.any(), golfCourseImageController.create);

namedRouter.get("api.bluetees.golfcourseimage.getbycourseid", '/golfcourseimage/getbycourseid/:courseId',request_param.any(), golfCourseImageController.getDetailsById);


module.exports = router;