const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

timesheetsRouter.param('timesheetId',(req, res, next, timesheetId)=>{
    db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`,
    (error,timesheet)=>{
        if(error){
            next(error);
        } else if(timesheet){
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

timesheetsRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
    (error,timesheets)=>{
        if(error){
            next(error);
        }else{
            res.status(200).json({timesheets: timesheets});
        }
    })
});

timesheetsRouter.post('/',(req,res,next)=>{
    const timesheetToCreate = req.body.timesheet;
    const hours = timesheetToCreate.hours;
    const rate = timesheetToCreate.rate;
    const date = timesheetToCreate.date;
    const employeeId = req.params.employeeId;

    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Timesheet (hours,rate,date,employee_id) ' + 
    'VALUES ($hour,$rate,$date,$employeeId)';
    const values = {
        $hour:hours,
        $rate:rate,
        $date:date,
        $employeeId:employeeId
    };

    db.run(sql,values,function(error){
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
            (error,timesheet)=>{
                res.status(201).json({timesheet: timesheet});
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next)=>{
    const timesheetToCreate = req.body.timesheet;
    const hours = timesheetToCreate.hours;
    const rate = timesheetToCreate.rate;
    const date = timesheetToCreate.date;
    const timesheetId = req.params.timesheetId;

    if(!hours || !rate || !date){
        return res.sendStatus(400);
    }    

    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date ' + 
        'WHERE id = $timesheetId';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: timesheetId
    };

    db.run(sql,values,function(error){
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`,
            (error,timesheet)=>{
                res.status(200).json({timesheet: timesheet});
            });
        }
    });
});

timesheetsRouter.delete('/:timesheetId',(req, res, next)=>{
    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`,
    (error)=>{
        if(error){
            next(error);
        }else{
            res.sendStatus(204);
        }
    });
});

module.exports = timesheetsRouter;