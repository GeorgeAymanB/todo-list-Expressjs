const express = require('express');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const app = express();
const port = 8081;

app.get('/', (req, res) => {
    fs.readFile('todo.html', 'utf8', (err, content) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        fs.readFile('tasks.txt', 'utf8', (err, tasksContent) => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }

            const taskList = tasksContent.split('\n').filter(task => task.trim() !== '');
            const taskItems = taskList.map(task => {
                const taskText = task.trim();
                const isDone = taskText.endsWith(" (DONE)");
                const taskDisplay = isDone ? taskText.slice(0, -7) : taskText;
                const taskClass = isDone ? 'done-task' : '';
                return `<li class="${taskClass}">${taskDisplay}</li>`;
            }).join('');

            const updatedContent = content.replace('<ol id="taskList"></ol>', `<ol id="taskList">${taskItems}</ol>`);
            res.status(200).send(updatedContent);
        });
    });
});

app.get('/tasks.txt', (req, res) => {
    const filePath = path.join(__dirname, 'tasks.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send(data);
        }
    });
});


app.post('/add', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const parsedBody = querystring.parse(body);
        const task = parsedBody.task;

        fs.appendFile('tasks.txt', task.toString() + '\n', 'utf8', err => {
            if (err) {
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/');
            }
        });
    });
});

app.put('/update', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const parsedBody = JSON.parse(body);
        const originalText = parsedBody.originalText;
        const newText = parsedBody.newText;

        fs.readFile('tasks.txt', 'utf8', (err, tasksContent) => {
            if (err) {
                res.status(500).send('Internal Server Error');
            } else {
                const updatedTasksContent = tasksContent.replace(originalText, newText);
                fs.writeFile('tasks.txt', updatedTasksContent, 'utf8', err => {
                    if (err) {
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.status(200).json({ message: 'Task updated successfully' });
                    }
                });
            }
        });
    });
});

app.delete('/clear', (req, res) => {
    fs.writeFile('tasks.txt', '', (err) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send('Tasks cleared successfully');
        }
    });
});

app.get('/wallpaper.jpg', (req, res) => {
    const imagePath = path.join(__dirname, 'wallpaper.jpg');
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            res.status(404).send('Image not found');
        } else {
            res.status(200).contentType('image/jpeg').send(data);
        }
    });
});

app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
