"use strict";

var csv = require('csv'),
    Sequelize = require('sequelize'),
    uuid = require('node-uuid'),
    async = require('async'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    path = require('path'),
    spawn = require('child_process').spawn,
    constants = require('../common/Constants'),
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
    
    app.get(rootPath + '/instructor/student/result', function (req, res)
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
                res.send({results: results});
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

        student.setInstructor(req.instructor).on('success', function (student)
        {
            var json = student.toJSON();
            json.id = student.id;
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
                    assignInstructor: instructor,
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
        
        // Note: I switched these async calls from parallel to serial execution because, in the case of an error, we don't want to run cleanup until all concurrently running tasks complete.  See https://github.com/caolan/async/issues/51
        
        async.series([
            function (callback)
            {
                getStudents(req.instructor, function (err, results, fields)
                {
                    if (err) return callback(err);
                    
                    // Replace coded fields with strings.
                    for (var i = 0; i < results.length; i++)
                    {
                        var r = results[i];
                        r.FirstDate = util.dateFormat(r.FirstDate * 1000, 'yyyy-mm-dd HH:MM:ss Z', true);
                        r.LastDate = util.dateFormat(r.LastDate * 1000, 'yyyy-mm-dd HH:MM:ss Z', true);
                    }
                    outputCSV(path.join(dir, archiveDir, 'students.csv'), results, fields, callback);
                });
            },
            function (callback)
            {
                getResults(req.instructor, function (err, results, fields)
                {
                    if (err) return callback(err);
                    
                    // Replace coded fields with strings.
                    for (var i = 0; i < results.length; i++)
                    {
                        var r = results[i];
                        r.medal = constants.medal.codeToString(r.medal);
                        r.endState = constants.endState.codeToString(r.endState);
                        r.endTime = util.dateFormat(r.endTime * 1000, 'yyyy-mm-dd HH:MM:ss Z', true);
                    }
                    
                    async.series([
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
            console.log('Copying ' + questionResults.length + ' game output files');
            
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
            console.log('Creating tarball at: ' + dir + '/archive.tar.gz');
            
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
            if (err)
            {
                console.log('Got an error:');
                console.log(err);
                next(err);
            }
            
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
        // Note: we do raw SQL queries because sequelize ORM doesn't support JOINs, so we end up having to create big mapping tables otherwise.
        var params = [];
        var query = '\
            SELECT \
                Students.id, \
                Students.rosterID, \
                Students.loginID, \
                Students.firstName, \
                Students.lastName, \
                Students.password, \
                Students.condition, \
                Instructors.loginID AS instructorLoginID, \
                SUM(endState <=> 0) AS completedGames, \
                COUNT(QuestionSetOutcomes.id) AS totalGames, \
                medalTable.GoldMedals, \
                medalTable.SilverMedals, \
                medalTable.BronzeMedals, \
                SUM(QuestionSetOutcomes.elapsedMS) AS TotalTime, \
                MIN(QuestionSetOutcomes.endTime) AS FirstDate, \
                MAX(QuestionSetOutcomes.endTime) AS LastDate \
            FROM Students \
                INNER JOIN Instructors ON Instructors.id = Students.InstructorId \
                LEFT JOIN QuestionSetOutcomes ON QuestionSetOutcomes.studentId = Students.id \
                LEFT JOIN ( \
                    SELECT \
                        studentId, \
                        SUM(medal <=> 3) AS GoldMedals, \
                        SUM(medal <=> 2) AS SilverMedals, \
                        SUM(medal <=> 1) AS BronzeMedals \
                    FROM ( \
                        SELECT \
                            DISTINCT \
                                studentId, \
                                MAX(medal) AS medal, \
                                stageID \
                        FROM \
                            QuestionSetOutcomes \
                        WHERE \
                            medal > 0 \
                            AND endState = 0 \
                        GROUP BY \
                            studentId, stageID \
                    ) AS T \
                    GROUP BY \
                        studentId \
                ) AS medalTable ON medalTable.studentId = Students.id \
        ';
        
        if (!instructor.isAdmin)
        {
            query += ' WHERE Instructors.id = ? ';
            params.push(instructor.id);
        }
        query += ' GROUP BY Students.id '
        model.customQuery(query, params, callback);
    }
    
    function getResults(instructor, callback)
    {
        var params = [];
        var query = '\
            SELECT \
                QuestionSetOutcomes.id,\
                Students.rosterID, \
                Students.loginID, \
                QuestionSetOutcomes.condition, \
                QuestionSetOutcomes.stageID, \
                QuestionSetOutcomes.questionSetID, \
                QuestionSetOutcomes.score, \
                QuestionSetOutcomes.medal, \
                QuestionSetOutcomes.elapsedMS, \
                QuestionSetOutcomes.endTime, \
                QuestionSetOutcomes.endState, \
                QuestionSetOutcomes.dataFile \
            FROM QuestionSetOutcomes \
            INNER JOIN Students ON Students.id = QuestionSetOutcomes.StudentId \
        ';
        if (!instructor.isAdmin)
        {
            query += 'WHERE Students.InstructorId = ?';
            params.push(instructor.id);
        }
        model.customQuery(query, params, callback);
    }
    
    function outputCSV(pathOrStream, results, fields, callback)
    {
        console.log('Writing CSV file to: ' + pathOrStream);
        
        var fieldNames = [];
        for (var field in fields) fieldNames.push(field);
        fieldNames.sort(function (a, b)
        {
            return fields[a].number - fields[b].number;
        });
        var csvWriter = csv({columns: fieldNames});
        csvWriter.on('end', function () {callback();});
        
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
