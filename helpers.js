//Source : https://stackabuse.com/handling-file-uploads-in-node-js-with-expres-and-multer/ 
const fileFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/.+\.pdf/)) {
        req.fileValidationError = 'Only pdf files are allowed!';
        return cb(new Error('Only pdf files are allowed!'), false);
    }
    cb(null, true);
};
exports.fileFilter = fileFilter;