const usermodels = {
    getAll: `
    SELECT 
    * 
    FROM 
    users`,
    getByID: `
    SELECT
    *
    FROM
    users
    WHERE
    id= ?
    `,
    addRow:`
    INSERT INTO
    users(
        username,
        email,
        password,
        name,
        lastname,
        phone_number,
        role_id,
        is_active
    )
    VALUES (
        ?,?,?,?,?,?,?,?
    )`,

    getByUsername:`
    SELECT
        id
    FROM
        users
    WHERE 
        username=?
        `,
    getByUsername2:`
    SELECT
        *
    FROM
        users
    WHERE 
        username=?
        `,
    getByEmail:`
    SELECT
        id
    FROM
        users
    WHERE 
        email=?
        `,
        
    getActualUser:`
    SELECT
       id
    FROM
        users
    WHERE
        username=?
    `,
    getActualEmail:`
    SELECT
       id
    FROM
        users
    WHERE
        email=?
    `,
    
    getActuData:`
    UPDATE
        users
    SET
        username = ?,
        email = ?,
        password = ?,
        name = ?,
        lastname = ?,
        phone_number = ?,
        role_id = ?,
        is_active = ?
    WHERE
        id=?`,
    deleteRow:`
    UPDATE
        users
    SET
        is_active=0
    WHERE
        id=?`
}

module.exports=usermodels;