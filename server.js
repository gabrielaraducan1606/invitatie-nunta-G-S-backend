const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const nodemailer = require("nodemailer"); 

const app = express();
const PORT = 5000;

// Configurare middleware
app.use(cors());
app.use(bodyParser.json());

// Configurare baza de date
const db = new sqlite3.Database("./invitatii.db", (err) => {
    if (err) {
        console.error("Eroare la conectarea bazei de date:", err);
    } else {
        console.log("Conectat la baza de date SQLite.");
    }
});

// Crearea tabelei în baza de date
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS invitatii (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nume TEXT,
        telefon TEXT,
        numar_persoane INTEGER,
        nume_invitati TEXT,
        numar_copii INTEGER,
        cazare TEXT,
        preferinte TEXT,
        comentarii TEXT
    )`);
});

// Configurare nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail", // Schimbă dacă folosești un alt serviciu de e-mail
    auth: {
        user: "nitagabriela05@gmail.com", // Înlocuiește cu e-mailul tău
        pass: "Gabrielaraducan.1606" // Parola sau App Password (pentru Gmail)
    },
});

// Endpoint pentru salvarea datelor și trimiterea e-mailului
app.post("/api/confirmare", (req, res) => {
    const {
        nume,
        telefon,
        numar_persoane,
        nume_invitati,
        numar_copii,
        cazare,
        preferinte,
        comentarii,
    } = req.body;

    // Salvarea în baza de date
    db.run(
        `INSERT INTO invitatii (nume, telefon, numar_persoane, nume_invitati, numar_copii, cazare, preferinte, comentarii) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nume, telefon, numar_persoane, JSON.stringify(nume_invitati), numar_copii, cazare, preferinte, comentarii],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Eroare la salvarea datelor." });
            }

            // Trimiterea e-mailului
            const mailOptions = {
                from: "emailultau@gmail.com",
                to: "destinatar@gmail.com", // Schimbă cu e-mailul unde vrei să primești datele
                subject: "Confirmare invitație nuntă",
                text: `
Nume complet: ${nume}
Telefon: ${telefon}
Număr persoane: ${numar_persoane}
Nume invitați: ${nume_invitati.join(", ")}
Număr copii: ${numar_copii}
Cazare: ${cazare ? "Da" : "Nu"}
Preferințe culinare: ${preferinte}
Comentarii: ${comentarii || "N/A"}
                `,
            };

            transporter.sendMail(mailOptions, (emailErr, info) => {
                if (emailErr) {
                    console.error("Eroare la trimiterea e-mailului:", emailErr);
                    return res.status(500).json({ error: "Eroare la trimiterea e-mailului." });
                }

                console.log("E-mail trimis:", info.response);
                res.json({ success: true, id: this.lastID, message: "Datele au fost salvate și trimise cu succes!" });
            });
        }
    );
});

// Pornirea serverului
app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});
