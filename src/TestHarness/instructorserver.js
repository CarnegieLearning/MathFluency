var express = require('express');

exports.addInstructorEndpoints = function (app, rootPath, gc, model, config)
{
    app.get(rootPath + '/instructor', function (req, res)
    {
        if (!req.instructor)
        {
            res.redirect('home');
            return;
        }
        res.render('instructor', {
            mainjs: 'instructor',
            conditions: gc.allConditionNames()
        });
    });
    
    app.get(rootPath + '/instructor/students', function (req ,res)
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
        if (!req.instructor.isAdmin)
        {
            query += 'WHERE Instructors.id = ?';
            params.push(req.instructor.id);
        }
        if (config.debug)
        {
            console.log('Custom Query:' + query.replace(/ +/g, ' '));
            console.log('Parameters: ' + params);
        }
        model.sequelize.pool.query(query, params, function (error, results, fields)
        {
            if (error)
            {
                console.log(error);
                res.send('Error fetching student data.', 500);
            }
            else
            {
                res.send({students: results});
            }
        });
    });
    
    app.get(rootPath + '/instructor/students/results', function (req, res)
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
        if (!req.instructor.isAdmin)
        {
            query += 'WHERE Students.InstructorId = ?';
            params.push(req.instructor.id);
        }
        if (config.debug)
        {
            console.log('Custom Query:' + query.replace(/ +/g, ' '));
            console.log('Parameters: ' + params);
        }
        model.sequelize.pool.query(query, params, function (error, results, fields)
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
    
    app.post(rootPath + '/instructor/student', function (req, res)
    {
        console.log('Creating new student with parameters:');
        console.log(req.body);
        if (req.body.loginID.length == 0)
        {
            res.send("Login ID cannot be empty", 400);
            return;
        }
        var student = model.Student.build(req.body);
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
            console.log('Error adding student:');
            console.log(error);
            res.send(error.message, 500);
        });
    });
};
