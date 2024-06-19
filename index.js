'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const { authorize, listData } = require('./config/sheets');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 443;

// Enable CORS for specific origin
const allowedOrigins = ['https://itb-peersupervision.netlify.app'];

const corsOptions = {
    origin: '*', // Mengizinkan semua origin sementara
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware untuk parsing application/json dan application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
var routerBKUser = require('./routers/bkuser_routes');
var routerPSUser = require('./routers/psuser_routes');
var routerResetPassUser = require('./routers/resetpass_routes');
var routerDampingan = require('./routers/dampingan_routes');
const routerJadwal = require('./routers/jadwal_routes');
const routerLaporan = require('./routers/laporan_routes');
const routerDownloadReport = require('./routers/download_report_routes');
const routerStats = require('./routers/statistic_routes');
const routerRujukan = require('./routers/rujukan_routes');

// Use routes
app.use('/bkusers', routerBKUser);
app.use('/psusers', routerPSUser);
app.use('/users', routerResetPassUser);
app.use('/dampingan', routerDampingan);
app.use('/jadwal', routerJadwal);
app.use('/laporan', routerLaporan);
app.use('/report', routerDownloadReport);
app.use('/stats', routerStats);
app.use('/rujukan', routerRujukan);

app.get('/hello', async (req, res) => {
    res.json({ message: 'Hello!' });
});

app.get('/', async (req, res) => {
    res.json({ message: 'This is Peer ITB Supervision API for BK ITB.' });
});

app.get('/fetch-data', async (req, res) => {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return res.status(500).json({ error: 'Error loading client secret file:' + err });
        authorize(JSON.parse(content), (auth) => {
            listData(auth, (result) => {
                res.json(result);
            });
        });
    });
});

// Load client secrets and authorize on server start
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), (auth) => {
        listData(auth); // Panggil listData setelah otorisasi
    });
});

// Jadwalkan tugas untuk mengambil data setiap jam
cron.schedule('0 * * * *', () => {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), (auth) => {
            listData(auth);
        });
    });
});

// Middleware untuk menangani kesalahan
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Baca file sertifikat dan kunci
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Buat server HTTPS
https.createServer(credentials, app).listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
