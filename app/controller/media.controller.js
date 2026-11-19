var Media = require('../model/media.model');
const multer = require("multer")
const path = require("path")
const crypto = require('crypto')
const moment = require('moment')
const fs = require("fs")
const { combineURLs } = require("../helper/common.helper")

const imageExtensions = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/gif', '.gif'],
]);

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const directory = path.join('uploads', moment().format('MMDDYYYY'));
        fs.mkdir(directory, { recursive: true }, (error) => cb(error, directory));
    },
    filename(req, file, cb) {
        cb(null, crypto.randomBytes(24).toString('hex') + imageExtensions.get(file.mimetype));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0 },
    fileFilter(req, file, cb) {
        cb(null, imageExtensions.has(file.mimetype));
    },
}).single('file');

exports.fileUpload = (req, res) => {
    upload(req, res, async (error) => {
        if (error?.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ status: false, message: 'Image exceeds 10 MiB' });
        }
        if (error || !req.file) {
            return res.status(400).json({ status: false, message: 'Provide one JPEG, PNG or GIF image' });
        }

        try {
            const directory = path.basename(req.file.destination);
            const media = await Media.create({
                media: `uploads/${directory}/${req.file.filename}`,
                user: req.user.id,
            });
            media.media = combineURLs(process.env.BASE_URL.trim(), media.media);
            res.send({ status: true, message: 'Media upload!', data: media });
        } catch {
            await fs.promises.unlink(req.file.path).catch(() => {});
            res.status(500).json({ status: false, message: 'Media not uploaded' });
        }
    });
};

var cron = require('node-cron');
// cron job runs every day at 01:00
cron.schedule('0 1 * * *', () => {
    console.log('running a cron job daily at 01:00 to delete mms folder older than 7 days');
    var startdate = moment();
    startdate = startdate.subtract(7, "days");
    startdate = startdate.format("DDMMYYYY");
    try {
        fs.rmdirSync("./uploads/" + startdate, { recursive: true });
    } catch (e) {
        console.log('folder not found')
    }
});
exports.deleteMedia = async (req, res) => {
    try {
        var startdate = moment();
        startdate = startdate.subtract(7, "days");
        startdate = startdate.format("DDMMYYYY");
        try {
            fs.rmdirSync("./uploads/" + startdate, { recursive: true });
        } catch (e) {
            console.log('folder not found')
        }
    } catch (error) {
        res.status(400).json({ status: 'false', message: 'something is wrong' });
    }
};