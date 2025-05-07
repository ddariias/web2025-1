const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const NOTES_DIR = path.join(__dirname, 'notes');
const upload = multer(); 

app.use(express.json()); 
app.use(express.text()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 

if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR);
}

app.get('/notes/:name', (req, res) => {
  const filePath = path.join(NOTES_DIR, req.params.name + '.txt');
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  const text = fs.readFileSync(filePath, 'utf-8');
  res.send(text);
});

app.put('/notes/:name', (req, res) => {
  const filePath = path.join(NOTES_DIR, req.params.name + '.txt');
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  fs.writeFileSync(filePath, req.body.text);
  res.sendStatus(200);
});

app.delete('/notes/:name', (req, res) => {
  const filePath = path.join(NOTES_DIR, req.params.name + '.txt');
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  fs.unlinkSync(filePath);
  res.sendStatus(200);
});

app.get('/notes', (req, res) => {
  const files = fs.readdirSync(NOTES_DIR);
  const notes = files.map(file => {
    const name = path.basename(file, '.txt');
    const text = fs.readFileSync(path.join(NOTES_DIR, file), 'utf-8');
    return { name, text };
  });
  res.status(200).json(notes);
});

app.post('/write', upload.none(), (req, res) => {
  const { note_name, note } = req.body;

  if (!note_name || !note) {
    return res.status(400).send('Відсутні обов’язкові поля');
  }

  const filePath = path.join(NOTES_DIR, note_name + '.txt');

  if (fs.existsSync(filePath)) {
    return res.sendStatus(400);
  }

  fs.writeFileSync(filePath, note);
  res.sendStatus(201);
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});


app.listen(PORT, () => {
  console.log(` Сервер працює на http://localhost:${PORT}`);
});
