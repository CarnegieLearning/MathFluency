"use strict";

/*
    Title: Test Harness Server
    
    Implementation of the Math Fluency <test harness at http://fluencychallenge.com/wiki/DesignAndImplementation/TestHarness>.
*/

var urllib = require('url'),
    fs = require('fs'),
    express = require('express'),
    restapi = require('../server/restapi'),
    modelInit = require('./model'),
    gameController = require('./gamecontroller').gameController,
    addInstructorEndpoints = require('./instructorserver').addInstructorEndpoints,
    MySQLSessionStore = require('connect-mysql-session')(express),
    form = require('connect-form'),
    resolveRelativePath = require('../server/serverutils').resolveRelativePath;


function runServer(config, model)
{
    config.outputPath = resolveRelativePath(config.outputPath, __dirname);
    config.cliDataPath = resolveRelativePath(config.cliDataPath, __dirname);
    config.gameConfig = resolveRelativePath(config.gameConfig, __dirname);
    
    var port = config.port || 80,
        rootPath = config.rootPath || '/';
    
    var gc = gameController(config, model);
    
    var app = express.createServer();
    if (rootPath && rootPath != '/')
    {
        app.set('home', rootPath);
    }
    else
    {
        rootPath = '';
    }
    express.logger.token('user', function (req, res)
    {
        return (req.instructor ? req.instructor.loginID + '(i)' :
                req.student ? req.student.loginID + '(s)' :
                '-');
    });
    if (config.debug)
    {
        app.use(express.logger({ format: 'dev' }));
    }
    else
    {
        app.use(express.logger({
            format: ':req[x-forwarded-for] :user [:date] :method :url :status :res[content-length] - :response-time ms'
        }));
    }
    app.set('view engine', 'ejs');
    app.set('views', resolveRelativePath('views', __dirname));
    
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
    app.use(form());
    app.use(express.cookieParser());
    app.use(express.session({
        store: new MySQLSessionStore(config.mysql.database, config.mysql.user, config.mysql.password, config.sequelizeOptions),
        secret: "keyboard cat",
        cookie: {
            maxAge: null
        }
    }));
    
    // Static handlers for client-side JS and game assets, etc.
    
    app.use(rootPath + '/js/node_modules', express.static(resolveRelativePath('../../node_modules', __dirname)));
    app.use(rootPath + '/js/common', express.static(resolveRelativePath('../common', __dirname)));
    app.use(rootPath + '/js/client', express.static(resolveRelativePath('../client', __dirname)));
    app.use(rootPath + '/js', express.static(resolveRelativePath('clientjs', __dirname)));
    app.use(rootPath + '/static', express.static(resolveRelativePath('../static', __dirname)));
    app.use(rootPath + '/static', express.directory(resolveRelativePath('../static', __dirname), {icons:true}));
    app.use(rootPath + '/output', express.static(config.outputPath));
    app.use(rootPath + '/output', express.directory(config.outputPath, {icons:true}));
    app.use(rootPath + '/css', express.static(resolveRelativePath('css', __dirname)));
    
    // These are the MATHia fluency tasks. On the production server, these are served directly by nginx instead of going through the node webapp. We have these static handlers so dev environment can run without the nginx reverse proxy.
    app.use(rootPath + '/fluency/data', express.static(resolveRelativePath('data', config.cliDataPath)));
    app.use(rootPath + '/fluency/data', express.directory(resolveRelativePath('data', config.cliDataPath), {icons:true}));
    app.use(rootPath + '/fluency/games', express.static(resolveRelativePath('games', config.cliDataPath)));
    app.use(rootPath + '/fluency/games', express.directory(resolveRelativePath('games', config.cliDataPath), {icons:true}));

    // Middleware to load student or instructor data before processing requests.
    
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
                
                // The REST API uses req.playerState, so set that too.
                req.playerState = student;
                
                next();
            });
        }
        else next();
    });
    
    // Helpers for commonly used template variables.
    
    app.helpers({
        config: config,
        logoutURL: rootPath + '/logout',
        rootPath: rootPath
    });
    app.dynamicHelpers({
        loginID: function (req)
        {
            if (req.instructor) return req.instructor.loginID;
            else if (req.student) return req.student.loginID;
            else return null;
        },
        instructor: function (req)
        {
            return req.instructor;
        },
        student: function (req)
        {
            return req.student;
        }
    });
    
    // Dynamic handlers for index template -- redirect depending on whether user is logged in as student, instructor, or neither.
    
    app.get(rootPath + '/', function (req, res)
    {
        if (req.session.studentID)
            res.redirect(rootPath + '/student');
        else if (req.session.instructorID)
            res.redirect(rootPath + '/instructor');
        else
            res.redirect(rootPath + '/login')
    });
    
    // Login and logout
    
    app.get(rootPath + '/login', function (req, res)
    {
        // Redirect if already logged in.
        if (req.instructor || req.student)
        {
            res.redirect(rootPath);
        }
        else
        {
            res.render('login', {mainjs: 'login'});
        }
    });
    app.post(rootPath + '/login/:studentOrInstructor', function (req, res)
    {
        var password = req.body.password;
        var loginID = req.body.loginID;
        var remember = req.body.remember;
        var isStudent = req.params.studentOrInstructor == 'student';
        
        if (isStudent && !config.requireStudentPassword)
        {
            model.Student.find({where: {loginID: loginID}}).on('success', callback);
        }
        else
        {
            var modelClass = model[isStudent ? 'Student' : 'Instructor'];
            modelClass.authenticate(loginID, password, callback);
        }
        
        function callback(entity)
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
        }
    });
    
    app.get(rootPath + '/logout', function (req, res)
    {
        req.session.destroy(function () {
            res.redirect('home');
        });
    });
    
    // Instructor page and endpoints
    // Refactored to instructorserver file.
    addInstructorEndpoints(app, rootPath, gc, model, config);
    
    // Student page and endpoints
    
    app.get(rootPath + '/student', function (req, res)
    {
        if (!req.student)
        {
            res.redirect('home');
            return;
        }
        gc.getAvailableStagesForPlayer(req.student, function (stages)
        {
            res.render('student', {
                mainjs: 'student',
                levels: stages
            });
        });
    });
    
    // Game instructions renderer.
    
    app.get(rootPath + '/instructions/:stage', function (req, res)
    {
        gc.getStage(req.params.stage, function (stage)
        {
            stage.getInstructionsHTML(rootPath + '/fluency', function (error, html)
            {
                if (error) return res.send(error.message, 500);
                
                res.render('instructions', {
                    instructionsHTML: html,
                    layout: null
                });
            });
        });
    });
    
    // The REST API handler.
    app.use(rootPath + '/api', restapi(gc));
    
    // Start the server.
    app.listen(port);
    console.log('Test harness server running on port ' + port + ' with URL root ' + rootPath);
}

if (require.main === module)
{
    if (process.argv.length > 3)
    {
        console.log('Invalid argument(s).');
        console.log('Usage: node servermain.js [CONFIG]');
        console.log('CONFIG is a path to a server config JSON file, defaulting to serverconfig.json.');
        process.exit(1);
    }
    var configFile = process.argv[2] || resolveRelativePath('config/debug.json', __dirname),
        configStr = fs.readFileSync(configFile, 'utf8'),
        config = JSON.parse(configStr);
    modelInit(config.mysql.database, config.mysql.user, config.mysql.password, config.sequelizeOptions, function (error, model)
    {
        if (error) throw error;
        
        runServer(config, model);
    });
    
    process.on('uncaughtException', function (err)
    {
        console.log('Uncaught exception!');
        console.log(err.stack);
    });
}
