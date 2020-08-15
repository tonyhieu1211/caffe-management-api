const express = require('express');
const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets.js');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

employeesRouter.param('employeeId',(req,res,next,employeeId)=>{
    const sql = 'SELECT * FROM Employee WHERE id = $employeeId';
    const values = {$employeeId: employeeId};

    db.get(sql,values,(error,employee)=>{
        if(error){
            next(error);
        } else if(employee){
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

employeesRouter.use('/:employeeId/timesheets',timesheetsRouter);

employeesRouter.get('/', (req,res,next)=>{
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
    (error,employees)=>{
        if(error){
            next(error);
        }else{
            res.status(200).json({employees: employees});
        }
    });
});

employeesRouter.get('/:employeeId', (req,res,next)=>{
    res.status(200).json({employee: req.employee});
});

employeesRouter.post('/', (req,res,next)=>{
    const employeeToCreate = req.body.employee;
    const name = employeeToCreate.name;
    const position = employeeToCreate.position;
    const wage = employeeToCreate.wage;
    const isCurrentEmployee = employeeToCreate.isCurrentEmployee === 0 ? 0 : 1;

    if(!name || !position || !wage){
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Employee (name,position,wage,is_current_employee) ' + 
        'VALUES ($name,$position,$wage,$isCurrentEmployee)';
    const value = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    }

    db.run(sql,value,function(error){
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`,
            (error,employee)=>{
                res.status(201).json({employee: employee});
            });
        }
    });
});

employeesRouter.put('/:employeeId',(req,res,next)=>{
    const employeeToCreate = req.body.employee;
    const name = employeeToCreate.name;
    const position = employeeToCreate.position;
    const wage = employeeToCreate.wage;
    const isCurrentEmployee = employeeToCreate.isCurrentEmployee === 0 ? 0 : 1;
    const employeeId = req.params.employeeId;

    if(!name || !position || !wage){
        return res.sendStatus(400);
    }
    
    const sql = 'UPDATE Employee SET name=$name,position=$position,wage=$wage,is_current_employee=$isCurrentEmployee ' + 
        'WHERE id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: employeeId
    }

    db.run(sql,values,(error)=>{
        if(error){
            next(error);
        } else{
            db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`,
            (error,employee)=>{
                res.status(200).json({employee: employee});
            })
        }
    })
});

employeesRouter.delete('/:employeeId', (req,res,next)=>{
    const employeeToDelete = req.params.employeeId;
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${employeeToDelete}`,
    (error)=>{
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Employee WHERE id = ${employeeToDelete}`,
            (error,employee)=>{
                res.status(200).json({employee: employee});
            });
        }
    });
});

module.exports = employeesRouter;