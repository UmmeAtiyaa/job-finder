const express = require('express');
const router = express.Router();
var multer = require('multer');
var bcrypt = require('bcryptjs');

const db = require('../database');
var connection = db();

var checkLogin = require('../middlewares/checkUserLogin')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/user')
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

var upload = multer({ storage: storage })
var uploadResume = upload.single('resume');

router.get('/', checkLogin, (req, res, next) => {
    connection.query('SELECT * FROM jobs', async (err, jobsData) => {
        if (err) {
            res.send(err)
        } else { 
            console.log(jobsData)
            res.render('users/index', { email: req.session.email, jobsData, noofjobs: jobsData.length })
        }
    })
})

router.get('/login', (req, res, next) => {
    res.render('users/login')
})

router.get('/register', (req, res, next) => {
    res.render('users/register')
})

router.post('/register', uploadResume, async (req, res, next) => {
    console.log(req.body.password)
    const password = await bcrypt.hash(req.body.password, 8)
    let user = { name: req.body.name, email: req.body.email, password: password, phone: req.body.phone, resume: req.file.path.substring(6) }
    let sql = 'INSERT INTO users SET ?';
    connection.query(sql, user, err => {
        if (err) {
            res.send(err)
        } else {
            req.session.email = req.body.email
            res.redirect('/')
        }
    })
})

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    connection.query('SELECT email, password FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) {
            console.log(err)
            res.send(err.sqlMessage)
        } else {
            if (result[0]) {
                if (await bcrypt.compare(password, result[0].password)) {
                    req.session.email = req.body.email
                    res.send('success')
                } else {
                    res.send('Incorrect Email and Password!')
                }
            } else {
                res.send('No user found with Email Address!')
            }
        }
    })
})

router.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/login')
})

router.get('/initial-tables', async (req, res, next) => {
    var query = "CREATE TABLE users(name varchar(25), email varchar(50) PRIMARY KEY, phone varchar(10), password varchar(60), resume varchar(100));"
    var query2 = "CREATE TABLE organizations(org_name varchar(25), org_email varchar(50) PRIMARY KEY, org_phone varchar(10), org_password varchar(60), org_logo varchar(60));"
    var query3 = "CREATE TABLE jobs(id INT AUTO_INCREMENT PRIMARY KEY, org_email varchar(50), job_title varchar(30), job_location varchar(20), job_type varchar(20), job_category varchar(30), job_desc varchar(5000), pay_1 varchar(30), pay_2 varchar(30), job_posted varchar(30), closing_date varchar(30), status varchar(20));"
    await connection.query(query)
    await connection.query(query2)
    await connection.query(query3)
    res.redirect('/login')
})

module.exports = router;