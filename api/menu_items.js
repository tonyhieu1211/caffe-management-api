const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const { isValidElement } = require('react');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

menuItemRouter.param('menuItemId',(req, res, next, menuItemId)=>{
    db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`,
    (error,menuItem)=>{
        if(error){
            next(error);
        } else if(menuItem){
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuItemRouter.get('/',(req, res, next)=>{
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (error,menuItems)=>{
        if(error){
            next(error);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

menuItemRouter.post('/',(req, res, next)=>{
    const menuItemToCreate = req.body.menuItem;
    const name = menuItemToCreate.name;
    const description = menuItemToCreate.description;
    const inventory = menuItemToCreate.inventory;
    const price = menuItemToCreate.price;

    if(!name || !description || !inventory || !price){
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO MenuItem (name,description,inventory,price,menu_id) VALUES ($name,$description,$inventory,$price,$menuId)';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
    };

    db.run(sql,values,function(error){
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
            (error,menuItem)=>{
                res.status(201).send({menuItem: menuItem});
            });
        }
    });
});

menuItemRouter.put('/:menuItemId',(req, res, next)=>{
    const menuItemToCreate = req.body.menuItem;
    const name = menuItemToCreate.name;
    const description = menuItemToCreate.description;
    const inventory = menuItemToCreate.inventory;
    const price = menuItemToCreate.price;
    const menuItemId = req.params.menuItemId;

    if(!name || !description || !inventory || !price){
        return res.sendStatus(400);
    }

    const sql = 'UPDATE MenuItem SET name=$name,description=$description,inventory=$inventory,price=$price ' +
        'WHERE id = $menuItemId';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: menuItemId
    };

    db.run(sql,values,(error)=>{
        if(error){
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`,
            (error,menuItem)=>{
                res.status(200).json({menuItem: menuItem});
            });
        }
    });
});

menuItemRouter.delete('/:menuItemId', (req, res, next)=>{
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`,
    (error)=>{
        if(error){
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = menuItemRouter;