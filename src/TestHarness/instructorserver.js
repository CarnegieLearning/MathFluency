"use strict";

var csv = require('csv'),
    Sequelize = require('sequelize'),
    uuid = require('node-uuid'),
    async = require('async'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    path = require('path'),
    spawn = require('child_process').spawn,
    util = require('../common/Utilities');

exports.addInstructorEndpoints = function (app, rootPath, gc, model, config)
{
    app.get(rootPath + '/instructor', function (req, res)
    {
        if (!req.instructor)
        {
            res.redirect('home');
            return;
        }
        var templateVars = {
            mainjs: 'instructor',
            conditions: ['[random]'].concat(gc.allConditionNames()),
            csvUploadURL: rootPath + '/instructor/student.csv'
        };
        if (req.instructor.isAdmin)
        {
            model.Instructor.findAll().on('success', function (instructors)
            {
                templateVars['instructors'] = instructors;
                doRender();
            });
        }
        else doRender();
        
        function doRender()
        {
            res.render('instructor', templateVars);
        }
    });
    
    app.get(rootPath + '/instructor/student.:format?', function (req ,res)
    {
        getStudents(req.instructor, function (error, results, fields)
        {
            if (error)
            {
                console.log(error);
                res.send('Error fetching student data.', 500);
            }
            else
            {
                if (req.params.format == 'csv')
                {
                    res.header('Content-Type', 'text/csv');
                    res.header('Content-Disposition', 'attachment; filename="students.csv"');
                    outputCSV(res, results, fields);
                }
                else
                {
                    res.send({students: results});
                }
            }
        });
    });
    
    app.get(rootPath + '/instructor/student/result.:format?', function (req, res)
    {
        getResults(req.instructor, function (error, results, fields)
        {
            if (error)
            {
                console.log(error);
                res.send('Error fetching game results data.', 500);
            }
            else
            {
                if (req.params.format == 'csv')
                {
                    res.header('Content-Type', 'text/csv');
                    res.header('Content-Disposition', 'attachment; filename="game-results.csv"');
                    outputCSV(res, results, fields);
                }
                else
                {
                    res.send({results: results});
                }
            }
        });
    });
    
    app.post(rootPath + '/instructor/student.:format?', function (req, res)
    {
        if (req.params.format == 'csv')
        {
            addStudentsFromCSV(req, res);
            return;
        }
        
        console.log('Creating new student with parameters:');
        console.log(req.body);
        if (req.body.loginID.length == 0)
        {
            res.send("Login ID cannot be empty", 400);
            return;
        }
        var condition = req.body.condition;
        if (condition == '[random]')
        {
            condition = util.randomItem(gc.allConditionNames());
        }
        var student = model.Student.build();
        student.loginID = req.body.loginID
        student.rosterID = req.body.rosterID
        student.lastName = req.body.lastName
        student.firstName = req.body.firstName
        student.password = req.body.password
        student.condition = condition

        student.setInstructor(req.instructor).on('success', function ()
        {
            var json = student.toJSON();
            json.instructorLoginID = req.instructor.loginID;
            json.gameCount = null;
            res.send({
                student: json
            });
        })
        .on('failure', function (error)
        {
            console.log('Error adding student: ' + error.message);
            console.log('  SQL: ' + error.sql);
            res.send(error.message, 500);
        });
    });
    
    function addStudentsFromCSV(req, res)
    {
        if (req.instructor.isAdmin)
        {
            var instructorID = parseInt(req.form.fields.instructorID);
            model.Instructor.find(instructorID).on('success', addForInstructor);
        }
        else
        {
            addForInstructor(req.instructor);
        }
        
        function addForInstructor(instructor)
        {
            var allConditions = gc.allConditionNames(),
                cond = req.form.fields.condition,
                file = req.form.files.file,
                students = [],
                skippedHeader = false;
            if (!file)
            {
                res.send('No file selected', 400);
                return;
            }
            csv()
            .fromPath(file.path)
            .transform(function (data)
            {
                // Remove leading #s.
                for (var col in data)
                {
                    data[col] = data[col].replace(/^#/, '');
                }
                return data;
            })
            .on('data', function (data)
            {
                if (!skippedHeader)
                {
                    skippedHeader = true;
                    return;
                }
                var condition = (cond == '[random]' ?
                                 util.randomItem(allConditions) :
                                 cond);
                students.push({
                    rosterID: data[0],
                    loginID: data[1],
                    lastName: data[2],
                    firstName: data[3],
                    password: data[0].substr(-4),
                    condition: condition
                });
            })
            .on('end', function ()
            {
                res.render('roster-upload-confirm', {
                    students: students,
                    instructor: instructor,
                    condition: cond,
                    file: file.filename,
                    formData: {
                        instructorID: instructor.id,
                        students: students,
                        condition: cond
                    },
                    mainjs: 'roster-upload'
                });
            })
            .on('error', function (error)
            {
                res.send(error.message, 500);
            });
        }
    }
    
    app.post(rootPath + '/instructor/roster-upload-confirm', function (req, res)
    {
        model.Instructor.find(parseInt(req.body.instructorID))
        .on('failure', function (error)
        {
            res.send(error.message, 500);
        })
        .on('success', function (instructor)
        {
            var chainer = new Sequelize.Utils.QueryChainer();
            for (var i in req.body.students)
            {
                var s = req.body.students[i];
                if (!s.loginID)
                {
                    res.send('Login ID cannot be empty', 400);
                    return;
                }
                var student = model.Student.build(s);
                student.condition = req.body.condition;
                chainer.add(student.setInstructor(instructor));
            }
            chainer.run()
            .on('failure', function (errors)
            {
                var messages = [];
                console.log(errors.length + ' errors adding ' + req.body.students.length + ' students:');
                for (var i = 0; i < errors.length; i++)
                {
                    console.log('  ' + errors[i].message);
                    messages.push(errors[i].message);
                }
                res.send({errors: messages}, 500);
            })
            .on('success', function ()
            {
                res.send({});
            });
        });
    });
    
    app.get(rootPath + '/instructor/export', function (req, res, next)
    {
        var dir = path.join('/tmp', 'testharness-export-' + uuid()),
            archiveDir = 'testharness-export',
            outputDir = path.join(dir, archiveDir, 'output');
        
        console.log('Creating export directory: ' + dir);
        // Octal literals are disallowed in strict mode, so 7<<6 is just another way of saying 0700, i.e. owner can read, write, and enter.
        fs.mkdirSync(dir, 7 << 6);
        fs.mkdirSync(dir + '/' + archiveDir, 7 << 6);
        fs.mkdirSync(outputDir, 7 << 6);
        
        async.parallel([
            function (callback)
            {
                getStudents(req.instructor, function (err, results, fields)
                {
                    if (err) return callback(err);
                    
                    outputCSV(path.join(dir, archiveDir, 'students.csv'), results, fields, callback);
                });
            },
            function (callback)
            {
                getResults(req.instructor, function (err, results, fields)
                {
                    if (err) return callback(err);
                    
                    async.parallel([
                        function (callback)
                        {
                            outputCSV(path.join(dir, archiveDir, 'game-results.csv'), results, fields, callback);
                        },
                        function (callback)
                        {
                            copyGames(results, callback);
                        }
                    ],
                    callback);
                });
            }
        ],
        function (err)
        {
            if (err) cleanup(err);
            else zipAndSend();
        });
        
        function copyGames(questionResults, callback)
        {
            async.forEach(questionResults,
            function (item, callback)
            {
                var inputPath = path.join(config.outputPath, item.dataFile);
                var outputPath = path.join(outputDir, item.dataFile);
                copyFile(inputPath, outputPath, callback);
            },
            callback);
        }
        
        function zipAndSend()
        {
            var tar = spawn('tar', ['czf', 'archive.tar.gz', archiveDir], {
                cwd: dir
            });
            tar.stdout.on('data', function (data) {
                console.log(data);
            }).setEncoding('ascii');
            tar.stderr.on('data', function (data) {
                console.log(data);
            }).setEncoding('ascii');
            tar.on('exit', function (code)
            {
                if (code != 0) return cleanup(new Error('tar failed with code ' + code));
                
                res.download(path.join(dir, 'archive.tar.gz'), 'testharness-export.tar.gz', cleanup);
            });
        }
        
        function cleanup(err)
        {
            if (err) next(err);
            
            console.log('Deleting export directory: ' + dir);
            rimraf(dir, function (err)
            {
                if (err)
                {
                    console.log(err.stack);
                }
            });
        }
    });
    
    function copyFile(inPath, outPath, callback)
    {
        var inStream = fs.createReadStream(inPath);
        var outStream = fs.createWriteStream(outPath);
        require('util').pump(inStream, outStream, callback);
    }
    
    function getStudents(instructor, callback)
    {
        // For admins, show all students along with which instructor they belong to.
        // Note: we do raw SQL queries because sequelize ORM doesn't support JOINs, so we end up having to create big mapping tables otherwise.  This requires sequelize >1.0.2 (currently not in npm yet) which exposes the MySQL connection pool.
        var params = [];
        var query = '\
            SELECT \
                Students.rosterID, \
                Students.loginID, \
                Students.firstName, \
                Students.lastName, \
                Students.password, \
                Students.condition, \
                Instructors.loginID AS instructorLoginID, \
                gameCount \
            FROM Students \
                INNER JOIN Instructors ON Instructors.id = Students.InstructorId \
                LEFT JOIN ( \
                    SELECT \
                        StudentId, \
                        COUNT(*) AS gameCount \
                    FROM QuestionSetOutcomes \
                    GROUP BY StudentID \
                ) GameCounts ON GameCounts.StudentId = Students.id \
        ';
        if (!instructor.isAdmin)
        {
            query += 'WHERE Instructors.id = ?';
            params.push(instructor.id);
        }
        if (config.debug)
        {
            console.log('Custom Query:' + query.replace(/ +/g, ' '));
            console.log('Parameters: ' + params);
        }
        model.sequelize.pool.query(query, params, callback);
    }
    
    function getResults(instructor, callback)
    {
        var params = [];
        var query = '\
            SELECT \
                Students.rosterID, \
                Students.loginID, \
                QuestionSetOutcomes.condition, \
                QuestionSetOutcomes.stageID, \
                QuestionSetOutcomes.questionSetID, \
                QuestionSetOutcomes.score, \
                QuestionSetOutcomes.medal, \
                QuestionSetOutcomes.elapsedMS, \
                QuestionSetOutcomes.endTime, \
                QuestionSetOutcomes.dataFile \
            FROM QuestionSetOutcomes \
            INNER JOIN Students ON Students.id = QuestionSetOutcomes.StudentId \
        ';
        if (!instructor.isAdmin)
        {
            query += 'WHERE Students.InstructorId = ?';
            params.push(instructor.id);
        }
        if (config.debug)
        {
            console.log('Custom Query:' + query.replace(/ +/g, ' '));
            console.log('Parameters: ' + params);
        }
        model.sequelize.pool.query(query, params, callback);
    }
    
    function outputCSV(pathOrStream, results, fields, callback)
    {
        var fieldNames = [];
        for (var field in fields) fieldNames.push(field);
        fieldNames.sort(function (a, b)
        {
            return fields[a].number - fields[b].number;
        });
        var csvWriter = csv();
        csvWriter.on('end', callback);
        
        if (typeof pathOrStream === 'string') csvWriter.toPath(pathOrStream);
        else csvWriter.toStream(pathOrStream);
        
        csvWriter.write(fieldNames);
        for (var i = 0; i < results.length; i++)
        {
            csvWriter.write(results[i]);
        }
        csvWriter.end();
    }
};
