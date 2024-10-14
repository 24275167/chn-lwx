const express = require('express');
const mysql = require('./crowdfunding_db.js');
const router = express.Router()
// 分类
router.get("/categories", async (req, res) => {
    try {
        const [data] = await mysql.query("SELECT * FROM CATEGORY");
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// 获取筹款对应的捐赠列表
router.get('/donations', async (req, res) => {
    const sql = `SELECT * FROM DONATION ORDER BY date DESC`;
    try {
        const [rows] = await mysql.query(sql);
        res.status(200).send(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
// 获取筹款对应的捐赠列表
router.get('/donation/:FUNDRAISER_ID', async (req, res) => {
    const { fundraiserId } = req.params;
    const sql = `SELECT * FROM DONATION WHERE FUNDRAISER_ID = ? ORDER BY date DESC`;
    try {
        const [rows] = await mysql.query(sql, [fundraiserId]);
        res.status(200).send(rows);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }

});
// 捐赠接口
router.post('/donation', async (req, res) => {
    const { AMOUNT, GIVER, FUNDRAISER_ID } = req.body;
    if (!AMOUNT || !GIVER || !FUNDRAISER_ID) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const sql = `INSERT INTO DONATION (AMOUNT, GIVER, FUNDRAISER_ID) VALUES (?, ?, ?)`;
    try {
        const [result] = await mysql.query(sql, [AMOUNT, GIVER, FUNDRAISER_ID]);
        res.status(200).send({ message: 'donation success!' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }

});



// 数据处理
async function dataHandler(FUNDRAISER) {
    if (FUNDRAISER.length) {
        const [CATEGORY] = await mysql.query('SELECT * FROM CATEGORY');
        return FUNDRAISER.map(item => {
            const category = CATEGORY.find(c => c.CATEGORY_ID === item.CATEGORY_ID);
            item['CATEGORY_NAME'] = category ? category.NAME : null;  // 提取并赋值类别名称
            return item;
        });
    }
    return FUNDRAISER;
}

// 筹款项目列表
router.get("/fundraisers", async (req, res) => {
    try {
        const [rows] = await mysql.query('SELECT * FROM FUNDRAISER ORDER BY FUNDRAISER_ID DESC');
        const data = await dataHandler(rows);
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 查询单个筹款项目
router.get("/fundraiser/:id", async (req, res) => {
    const fundraiserId = req.params.id;
    try {
        const [rows] = await mysql.query('SELECT * FROM FUNDRAISER WHERE FUNDRAISER_ID = ?', [fundraiserId]);
        if (rows.length === 0) {
            return res.status(404).send({ error: 'notfound' });
        }
        const data = await dataHandler(rows);

        res.status(200).send(data[0]);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 创建新的筹款项目
router.post("/fundraiser", async (req, res) => {
    const { ORGANIZER, CAPTION, CATEGORY_ID, CITY, CURRENT_FUNDING, TARGET_FUNDING, ACTIVE } = req.body;
    try {
        const [result] = await mysql.query('INSERT INTO FUNDRAISER (ORGANIZER, CAPTION, CATEGORY_ID, CITY, CURRENT_FUNDING, TARGET_FUNDING,ACTIVE) VALUES (?,?,?,?,?,?,?)',
            [ORGANIZER, CAPTION, CATEGORY_ID, CITY, CURRENT_FUNDING, TARGET_FUNDING, ACTIVE]);
        res.status(200).send({ message: 'create success!' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 更新现有筹款项目
router.put("/fundraiser/:id", async (req, res) => {
    const fundraiserId = req.params.id;
    const { ORGANIZER, CAPTION, CATEGORY_ID, CITY, CURRENT_FUNDING, TARGET_FUNDING } = req.body;

    try {
        const [result] = await mysql.query(
            `   UPDATE FUNDRAISER SET 
                ORGANIZER = ?,
                CAPTION = ?,
                CATEGORY_ID = ?,
                CITY = ?,
                CURRENT_FUNDING = ?,
                TARGET_FUNDING = ?
                WHERE FUNDRAISER_ID = ?`,
            [ORGANIZER, CAPTION, CATEGORY_ID, CITY, CURRENT_FUNDING, TARGET_FUNDING, fundraiserId]);
        if (result.affectedRows === 0) {
            return res.status(400).send({ error: 'notfound' });
        }
        res.status(200).send({ id: fundraiserId });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// 删除筹款项目
router.delete("/fundraiser/:id", async (req, res) => {
    const fundraiserId = req.params.id;
    try {
        // 查询是否有捐赠
        const [rows] = await mysql.query('SELECT * FROM FUNDRAISER WHERE FUNDRAISER_ID = ?', [fundraiserId]);
        if (Number(rows[0].CURRENT_FUNDING)) {
            return res.status(200).send({ message: 'Donated fundraisers cannot be deleted!' });
        }
        const [result] = await mysql.query('DELETE FROM FUNDRAISER WHERE FUNDRAISER_ID = ?', [fundraiserId]);
        if (result.affectedRows === 0) {
            return res.status(200).send({ error: 'notfound' });
        }
        res.status(200).send({ message: 'delete success' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});


// 搜索
router.get("/search", async (req, res) => {
    const { organizer, city, category } = req.query;
    let sql = ''
    if (organizer) {
        sql += sql ? 'AND' : 'WHERE' + ` ORGANIZER = '${organizer}'`
    }
    if (city) {
        sql += sql ? 'AND' : 'WHERE' + ` CITY = '${city}'`
    }
    if (category) {
        sql += sql ? 'AND' : 'WHERE' + ` CATEGORY_ID = ${category}`
    }
    try {
        const [row] = await mysql.query(`SELECT * FROM FUNDRAISER ` + sql);
        const data = await dataHandler(row);
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});
module.exports=router
