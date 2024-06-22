const fs = require('fs');
const { google } = require('googleapis');
const mysqlConn = require('../config/db');

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile('token.json', (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile('token.json', JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to token.json');
            });
            callback(oAuth2Client);
        });
    });
}

function listData(auth, callback) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '12eujA0Wvh0hsiEGo0-MhXyekW79qylH-lnRZCloYn28';
    const range = 'Form responses 1!B:AD';

    sheets.spreadsheets.values.get({ spreadsheetId, range }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            const header = rows[0];
            const indexOfflineKonseling1 = header.indexOf('Kira-kira apakah kamu perlu konseling offline?');
            const indexOfflineKonseling2 = header.lastIndexOf('Kira-kira apakah kamu perlu konseling offline?');
            const indexContactOrListen = header.indexOf('Apa kamu mau dikontak atau didengerin langsung terkait cerita unek2 kamu?');

            // Filtering the rows based on conditions
            const filteredRows = rows.slice(1).filter(row => {
                const answer1 = row[indexOfflineKonseling1];
                const answer2 = row[indexOfflineKonseling2];
                const contactOrListenAnswer = row[indexContactOrListen];
                return (answer1 !== null || answer2 !== null) && contactOrListenAnswer !== 'Tidak';
            });

            if (filteredRows.length) {
                const queryCheck = 'SELECT * FROM dampingan WHERE initial = ? AND kontak = ? AND sesi = ?';

                const values = filteredRows.map(row => [
                    row[header.indexOf('Kalau boleh tau nama kamu siapa nih?? (mau Anonim juga boleh kok)')],
                    row[header.indexOf('Jenis kelamin')],
                    row[header.indexOf('Fakultas / Sekolah apaa?')],
                    row[header.indexOf('Angkatan berapa nih kalau boleh tau??')],
                    row[header.indexOf('Kamu tingkat sarjana / pascasarjana ya?')],
                    row[header.indexOf('Dari  Kampus mana ya?? Siapa tau bisa nongkrong bareng, hehehe~')],
                    row[header.indexOf('Kalau boleh dikontak, bisa dikontak lewat apa yak? (jika butuh jawaban cepat, sangat disarankan untuk memilih WA/Line) ')],
                    row[header.indexOf('Boleh minta no HP/email/apapun yang bisa kami hubungi?? (harus sinkron sama yang pertanyaan diatas)\n\nKesalahan menulis kontak akan mempersulit kami untuk menghubungi anda~\n\n*Pastikan ulang NOMOR atau KONTAK yang dihubungi SUDAH BENAR')],
                    (row[indexOfflineKonseling1] === 'Ya, perlu sesi offline' || row[indexOfflineKonseling2] === 'Ya, perlu sesi offline') ? 'Offline' : 'Online',
                ]);

                const filteredValues = [];

                const checkAndInsert = (index) => {
                    if (index >= values.length) {
                        if (filteredValues.length > 0) {
                            // Function to create data in dampingan and rujukan
                            const createDampinganAndRujukan = (dampinganData, callback) => {
                                const { initial, fakultas, gender, angkatan, tingkat, kampus, mediakontak, kontak, katakunci, katakunci2, sesi, psname } = dampinganData;
                                const createDampinganQuery = `
                                    INSERT INTO dampingan (initial, fakultas, gender, angkatan, tingkat, kampus, mediakontak, kontak, katakunci, katakunci2, sesi, psnim, psname)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT psnim FROM psusers WHERE psname = ?), ?);
                                `;
                                const getLastReqIdQuery = `
                                    SELECT reqid FROM dampingan ORDER BY reqid DESC LIMIT 1;
                                `;
                                const createRujukanQuery = `
                                    INSERT INTO rujukan (reqid, initial, isRujukanNeed)
                                    VALUES (?, ?, 0);
                                `;

                                // Mulai transaksi
                                mysqlConn.beginTransaction((err) => {
                                    if (err) {
                                        console.error('Error starting transaction:', err);
                                        callback(err, null);
                                        return;
                                    }

                                    // Jalankan query untuk membuat data dampingan
                                    mysqlConn.query(createDampinganQuery, [
                                        initial, fakultas, gender, angkatan, tingkat, kampus, mediakontak, kontak, katakunci, katakunci2, sesi, psname, psname
                                    ], (err, result) => {
                                        if (err) {
                                            return mysqlConn.rollback(() => {
                                                console.error('Error creating dampingan:', err);
                                                callback(err, null);
                                            });
                                        }

                                        // Ambil reqid dari baris paling bawah (baru)
                                        mysqlConn.query(getLastReqIdQuery, (err, results) => {
                                            if (err) {
                                                return mysqlConn.rollback(() => {
                                                    console.error('Error getting last reqid:', err);
                                                    callback(err, null);
                                                });
                                            }

                                            const reqid = results[0].reqid;

                                            // Buat data baru dalam tabel rujukan
                                            mysqlConn.query(createRujukanQuery, [reqid, initial], (err, result) => {
                                                if (err) {
                                                    return mysqlConn.rollback(() => {
                                                        console.error('Error creating rujukan:', err);
                                                        callback(err, null);
                                                    });
                                                }

                                                // Commit transaksi jika semua query berhasil
                                                mysqlConn.commit((err) => {
                                                    if (err) {
                                                        return mysqlConn.rollback(() => {
                                                            console.error('Error committing transaction:', err);
                                                            callback(err, null);
                                                        });
                                                    }

                                                    callback(null, result);
                                                });
                                            });
                                        });
                                    });
                                });
                            };

                            filteredValues.forEach(value => {
                                const [initial, gender, fakultas, angkatan, tingkat, kampus, mediakontak, kontak, sesi] = value;
                                const dampinganData = {
                                    initial,
                                    gender,
                                    fakultas,
                                    angkatan,
                                    tingkat,
                                    kampus,
                                    mediakontak,
                                    kontak,
                                    katakunci: '',
                                    katakunci2: '',
                                    sesi,
                                    psname: '' // Add appropriate psname if needed
                                };

                                createDampinganAndRujukan(dampinganData, (err, result) => {
                                    if (err) {
                                        console.error('Error creating dampingan and rujukan:', err);
                                    } else {
                                        console.log('Data inserted into MySQL');
                                    }
                                });
                            });

                            if (callback) {
                                callback(filteredRows);
                            }
                        } else if (callback) {
                            callback(filteredRows);
                        }
                        return;
                    }

                    const value = values[index];
                    const [initial, , , , , , , kontak, sesi] = value;

                    mysqlConn.query(queryCheck, [initial, kontak, sesi], (error, results) => {
                        if (error) {
                            console.error('Error executing query:', error.message);
                            return checkAndInsert(index + 1);
                        }

                        if (results.length === 0) {
                            filteredValues.push(value);
                        }
                        checkAndInsert(index + 1);
                    });
                };

                checkAndInsert(0);
            } else {
                console.log('No data found.');
                if (callback) {
                    callback([]);
                }
            }
        } else {
            console.log('No data found.');
            if (callback) {
                callback([]);
            }
        }
    });
}

module.exports = { authorize, listData };
