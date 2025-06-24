const multer = require('multer');

// configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // append timestamp to the original filename
    },
});

// file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // accept file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and jpg are allowed.'), false); // reject file
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;