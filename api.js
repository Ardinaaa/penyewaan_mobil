const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql")
const app = express()
const multer = require("multer") //uplode file 
const path = require("path")
const fs = require("body-parser")
const moment = require("moment")

app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// membbuat variabel untuk konfigurasi proses uplod file
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './image');
    },
    filename: (req, file, cb)=> {
        cb(null, "image-"+ Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "penyewaan"
})

db.connect(error =>{
    if(error){
        console.log(error.message)
    } else{
        console.log("MySQL Connested")
    }
})


// ====================================CRUD MOBIL=============================================================

app.get("/mobil", (req, res) => {
    //create sql query
    let sql = "select * from mobil"

    //run query
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message //pesan error
            }
        } else {
            response = {
                count: result.length, //jumlah data
                user: result //isi data
            }
        }
        res.json(response) //send response
    })
})

//end point akses data siswa berdasarkan id_siswa tertentu
app.get("/mobil/:id", (req, res) => {
    let data = {
        id_mobil: req.params.id_user
    }
    //create sql query
    let sql = "select * from mobil where ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message //pesan error
            }
        } else {
            response = {
                count: result.length, //jumlah data
                user: result //isi data
            }
        }
        res.json(response) //send response
    })
})

app.post("/mobil", upload.single("image"), (req,res)=>{
    let data ={
        nomor_mobil: req.body.nomor_mobil,
        merk: req.body.merk,
        jenis: req.body.jenis,
        warna: req.body.warna,
        tahun_pembuatan: req.body.tahun_pembuatan,
        biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
        image: req.file.filename
    }

    if (!req.file){
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else{
        let sql = "insert into mobil set ?"

        db.query(sql, data, (error, result)=>{
            if(error) throw error
            res.json({
                message: result.affecttedRows + " data berhasil disimpan "
            })
        })
    }
})

app.put("/mobil", upload.single("image"), (req,res)=>{
    let data = null, sql = null
    let param = { id_mobil: req.body.id_barang }

    if (!req.file){
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.file.filename
        }

    } else{
        data = {
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.file.filename
        }
        sql = "select * from mobil where ?"

        db.query(sql, param, (err, result)=>{
            if (err) throw err
            let fileName = result[0].image

            let dir = path.join(__dirname,"image",fileName)
            fs.unlink(dir, (error)=>{})
        })
    }
    sql = "update mobil  set ? where ?"  
    db.query(sql, [data,param], (error, result)=>{
        if (error){
            res.json({
                message: error.message
            })
        } else{
            res.json({
                message: result.affecttedRows + "data berhasil diubah"
            })
        }
    })
})

app.delete("/mobil/:id_mobil", (req,res)=>{
    let param = {id_mobil: req.params.id_mobil}
    let sql = "select * from mobil where ?"

    db.query(sql, param, (error, result)=>{
        if (error) throw error

        let fileName = result[0].image

        let dir = path.join(__dirname, "image",fileName)
        fs.unlink(dir, (error)=>{})
    })

    sql = "delete from mobil wjere ?"
    db.query(sql, param, (error, result)=>{
        if (error){
            res.json({
                message: error.message
            })
        } else{
            res.json({
                message: result.affecttedRows + "data berhasil dihapus"
            })
        }
    })
})

// =====================================================CRUD PELANGGAN========================================================

app.get("/pelanggan", (req, res) => {
    let sql = "select * from pelanggan"

    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message //pesan error
            }
        } else {
            response = {
                count: result.length, //jumlah data
                pelanggan: result //isi data
            }
        }
        res.json(response) //send response
    })
})

//end point akses data siswa berdasarkan id_siswa tertentu
app.get("/pelanggan/:id", (req, res) => {
    let data = {
        id_pelanggan: req.params.id
    }
    //create sql query
    let sql = "select * from pelanggan where ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message //pesan error
            }
        } else {
            response = {
                count: result.length, //jumlah data
                pelanggan: result //isi data
            }
        }
        res.json(response) //send response
    })
})

//end point menyimpan data siswa
app.post("/pelanggan", (req, res) => {

    //prepare data
    let data = {
        nama_mobil: req.body.nama_mobil,
        alamat_pelanggan: req.body.alamat_pelanggan,
        kontak: req.body.pelanggan
    }

    //create sql query insert
    let sql = "insert into pelanggan set ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response) //send response
    })
})

//end point mengubah data siswa
app.put("/pelanggan", (req, res) => {

    //prepare data
    let data = [
        //data
        {
            nama_mobil: req.body.nama_mobil,
            alamat_pelanggan: req.body.alamat_pelanggan,
            kontak: req.body.pelanggan
        },

        //parameter (primary key)
        {
            id_pelanggan: req.body.id_pelanggan
        }
    ]

    //create sql query update
    let sql = "update pelanggan set ? where ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + "data updated"
            }
        }
        res.json(response) //send response
    })
})

//end point menghapus data siswa berdasarkan id_siswa
    app.delete("/pelanggan/:id", (req, res) => {
    //prepare data
    let data = {
        id_pelanggan: req.params.id
    }

    //create query sql delete
    let sql = "delete from pelanggan where ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response) //send response
    })
})

// =======================================================CRUD KARYAWAN==================================================

app.get("/karyawan", (req, res) => {
    let sql = "select * from karyawan"

    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message //pesan error
            }
        } else {
            response = {
                count: result.length, //jumlah data
                pelanggan: result //isi data
            }
        }
        res.json(response) //send response
    })
})

//end point akses data siswa berdasarkan id_siswa tertentu
app.get("/karyawan/:id", (req, res) => {
    let data = {
        id_karyawan: req.params.id
    }
    //create sql query
    let sql = "select * from karyawan where ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message //pesan error
            }
        } else {
            response = {
                count: result.length, //jumlah data
                pelanggan: result //isi data
            }
        }
        res.json(response) //send response
    })
})

//end point menyimpan data siswa
app.post("/karyawan", (req, res) => {

    //prepare data
    let data = {
        nama_karyawan: req.body.nama_karyawan,
        alamat_karyawan: req.body.alamat_karyawan,
        kontak: req.body.pelanggan,
        username: req.body.username,
        password: req.body.password
    }

    //create sql query insert
    let sql = "insert into karyawan set ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response) //send response
    })
})

//end point mengubah data siswa
app.put("/karyawan", (req, res) => {

    //prepare data
    let data = [
        //data
        {
            nama_karyawan: req.body.nama_karyawan,
            alamat_karyawan: req.body.alamat_karyawan,
            kontak: req.body.pelanggan,
            username: req.body.username,
            password: req.body.password
        },

        //parameter (primary key)
        {
            id_karyawan: req.body.id_karyawan
        }
    ]

    //create sql query update
    let sql = "update karyawan set ? where ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + "data updated"
            }
        }
        res.json(response) //send response
    })
})

//end point menghapus data siswa berdasarkan id_siswa
    app.delete("/karyawan/:id", (req, res) => {
    //prepare data
    let data = {
        id_karyawan: req.params.id
    }

    //create query sql delete
    let sql = "delete from karyawan where ?"

    //run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response) //send response
    })
})

app.listen(8000, ()=>{
    console.log("ini bisa kok")
})