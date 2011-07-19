/*
    Title: Test Harness Server
    
    Implementation of the Math Fluency <test harness at http://fluencychallenge.com/wiki/DesignAndImplementation/TestHarness>.
*/

var urllib = require('url'),
    fs = require('fs'),
    express = require('express'),
    restapi = require('../server/restapi'),
    model = require('./model'),
    gameController = require('./gamecontroller').gameController,
    MySQLSessionStore = require('connect-mysql-session')(express);


function runServer(configPath)
{
    var config = require(configPath),
        port = config.port || 80,
        rootPath = config.rootPath || '/',
        outputPath = config.outputPath || __dirname + '/output';
    
    var gc = gameController(outputPath);
    
    // Create a simple server that presents a single HTML page and responds to AJAX API requests to launch the static games.
    var app = express.createServer();
    if (rootPath && rootPath != '/')
    {
        app.set('home', rootPath);
    }
    else
    {
        rootPath = '';
    }
    app.configure('development', function ()
    {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.use(express.logger());
    });
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        store: new MySQLSessionStore(config.mysql.database, config.mysql.user, config.mysql.password),
        secret: "keyboard cat",
        cookie: {
            maxAge: null
        }
    }));
    
    // Static handlers for client-side JS and game assessts, etc.
    app.use(rootPath + '/js/node_modules', express.static(__dirname + '/../../node_modules'));
    app.use(rootPath + '/js/common', express.static(__dirname + '/../common'));
    app.use(rootPath + '/js/client', express.static(__dirname + '/../client'));
    app.use(rootPath + '/js', express.static(__dirname));
    app.use(rootPath + '/static', express.static(__dirname + '/../static'));
    app.use(rootPath + '/static', express.directory(__dirname + '/../static', {icons:true}));
    app.use(rootPath + '/output', express.static(outputPath));
    app.use(rootPath + '/output', express.directory(outputPath, {icons:true}));
    app.use(rootPath + '/css', express.static(__dirname + '/css'));
    
    app.use(function (req, res, next)
    {
        if (req.session && req.session.instructorID)
        {
            model.Instructor.find(req.session.instructorID).on('success', function (instructor)
            {
                req.instructor = instructor;
                next();
            });
        }
        else if (req.session && req.session.studentID)
        {
            gc.getPlayerState(req.session.studentID, function (student)
            {
                req.student = student;
                next();
            });
        }
        else next();
    });
    
    app.helpers({
        logoutURL: rootPath + '/logout'
    });
    app.dynamicHelpers({
        loginID: function (req, res)
        {
            if (req.instructor) return req.instructor.loginID;
            else if (req.student) return req.student.loginID;
            else return null;
        }
    });
    
    app.use(rootPath + '/instructor', function (req, res, next)
    {
        if (!req.instructor) res.redirect('home');
        else next();
    });
    
    // Dynamic handlers for index template -- require a trailing slash so client-side relative paths work correctly.
    app.get(rootPath + '/', function (req, res)
    {
        if (req.session.studentID)
            res.redirect(rootPath + '/student');
        else if (req.session.instructorID)
            res.redirect(rootPath + '/instructor');
        else
            res.redirect(rootPath + '/login')
    });
    
    app.get(rootPath + '/login', function (req, res)
    {
        // Redirect if already logged in.
        if (req.instructor || req.student)
        {
            res.redirect(rootPath);
        }
        else
        {
            res.render('login', {mainjs: 'clientlogin'});
        }
    });
    app.post(rootPath + '/login/:studentOrInstructor', function (req, res)
    {
        var password = req.body.password;
        var loginID = req.body.loginID;
        var remember = req.body.remember;
        var isStudent = req.params.studentOrInstructor == 'student';
        var modelClass = model[isStudent ? 'Student' : 'Instructor'];
        modelClass.authenticate(loginID, password, function (entity)
        {
            if (entity)
            {
                req.session[isStudent ? 'studentID' : 'instructorID'] = entity.id;
                if (remember)
                {
                    req.session.cookie.maxAge = config.longSessionLength;
                }
                res.send("logged in");
            }
            else
            {
                res.send('Login ID and/or password is incorrect.', 400);
            }
        });
    });
    
    app.get(rootPath + '/logout', function (req, res)
    {
        req.session.destroy();
        res.redirect('home');
    });
    
    app.get(rootPath + '/instructor', function (req, res)
    {
        req.instructor.getStudents().on('success', function (students)
        {
            res.render('instructor', {
                mainjs: 'clientinstructor',
                students: students,
                conditions: gc.allConditionNames()
            });
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
            res.send({
                student: student.toJSON()
            });
        })
        .on('failure', function (error)
        {
            console.log('Error adding student:');
            console.log(error);
            res.send(error.message, 500);
        });
    });
    
    // The REST API handler.
    app.use(rootPath, restapi(gc));
    
    // Start the server.
    app.listen(port);
    console.log('Test harness server running on port ' + port + ' with URL root ' + rootPath);
}

if (require.main === module)
{
    if (process.argv.length > 2)
    {
        console.log('Invalid argument(s).');
        console.log('Usage: node servermain.js [CONFIG]');
        console.log('CONFIG is a path to a server config JSON file, defaulting to serverconfig.json.');
        process.exit(1);
    }
    var configFile = process.argv[2] || './serverconfig.js';
    model.init(false, function (error)
    {
        runServer(configFile);
    });
}
