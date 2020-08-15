const express = require('express');
const menusRouter = express.Router();
const menuItemRouter = require('./menu_items');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

menusRouter.param('menuId',(req, res, next, menuId)=>{
    db.get(`SELECT * FROM Menu WHERE id = ${menuId}`,
    (error,menu)=>{
        if(error){
            next(error)
        } else if(menu){
            req.menu = menu;
            next();
        } else{
             res.sendStatus(404);
        }
    })
});

menusRouter.use('/:menuId/menu-items',menuItemRouter);

menusRouter.get('/',(req, res, next)=>{
    db.all(`SELECT * FROM Menu`,(error,menus)=>{
        res.status(200).json({menus: menus});
    });
});

menusRouter.get('/:menuId',(req, res, next)=>{
    res.status(200).json({menu: req.menu});
});

menusRouter.post('/',(req, res, next)=>{
    const title = req.body.menu.title;
    if(!title){
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {
        $title: title
    }
    db.run(sql,values,
    function(error){
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`,
            (error,menu)=>{
                res.status(201).json({menu: menu});
            });
        }
    });
});

menusRouter.put('/:menuId',(req, res, next)=>{
    const title = req.body.menu.title;
    const menuId = req.params.menuId;
    if(!title){
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Menu SET title = $title WHERE id = $menuId';
    const values = {
        $title: title,
        $menuId: menuId
    }

    db.run(sql,values,
    (error)=>{
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Menu WHERE id = ${menuId}`,
            (error,menu)=>{
                res.status(200).json({menu: menu});
            });
        }
    });
});

menusRouter.delete('/:menuId', (req,res,next)=>{
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (error,menuItems)=>{
        if(error){
            next(error);
        } else if(menuItems){
            res.sendStatus(400);
        } else {
            db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`,(error)=>{
                if(error){
                    next(error);
                }else{
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menusRouter;