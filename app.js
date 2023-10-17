import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();
const app = express();
const upload = multer({ dest: 'uploads/' }); // save uploaded files to 'uploads/' directory

app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            // Save to database using Prisma
            for (const row of results) {
              console.log(row);
                await prisma.taxi.create({
                    data: {
                        ruta: parseInt(row.ruta),
                        placa: row.placa,
                    }
                });
            }
            
            // Cleanup: delete the uploaded file after processing
            fs.unlinkSync(filePath);

            res.send("Data uploaded successfully!");
        });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});