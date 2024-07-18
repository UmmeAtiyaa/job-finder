const express = require('express');
const router = express.Router();

const checkOrgLogin = require('../middlewares/checkOrgLogin')

const db = require('../database')
var connection = db();

router.get('/manage-jobs', checkOrgLogin, (req, res, next) => {
    var org_email = req.session.org_email;
    connection.query('SELECT * FROM jobs WHERE org_email = ?', [org_email], async (err, jobsData) => {
        if (err) {
            res.send(err)
        } else { 
            console.log(jobsData)
            res.render('org/manage-jobs', { jobsData })
        }
    })
})

router.get('/add-job', checkOrgLogin, (req, res, next) => {
    res.render('org/add-job')
})

router.post('/add-job', checkOrgLogin, async (req, res, next) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '-' + dd + '-' + yyyy;

    let job = { org_email: req.session.org_email, job_title: req.body.job_title, job_location: req.body.job_location, job_type: req.body.job_type, job_category: req.body.job_category, job_desc: req.body.job_desc, pay_1: req.body.pay_1, pay_2: req.body.pay_2, job_posted: today, closing_date: req.body.closing_date, status: 'Active' }
    let sql = 'INSERT INTO jobs SET ?';
    connection.query(sql, job, err => {
        if (err) {
            res.send(err.sqlMessage)
        } else {
            res.send('success')
        }
    })
})

module.exports = router;