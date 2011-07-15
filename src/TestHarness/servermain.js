/*
    Title: Test Harness Server
    
    Implementation of the Math Fluency <test harness at http://fluencychallenge.com/wiki/DesignAndImplementation/TestHarness>.
*/

var urllib = require('url'),
    express = require('express'),
    restapi = require('../server/restapi'),
    model = require('./model'),
    Sequelize = require('sequelize');


function runServer(port, rootPath, outputPath)
{
    //var gc = games.gameController(outputPath);
    var gc = null;
    
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
    app.use(express.session({ secret: "keyboard cat" }));
    
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
            model.Student.find(req.session.studentID).on('success', function (student)
            {
                req.student = student;
                next();
            });
        }
        else next();
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
        res.render('login', {mainjs: 'clientlogin'});
    });
    app.post(rootPath + '/login/:studentOrInstructor', function (req, res)
    {
        var password = req.body.password;
        var loginID = req.body.loginID;
        var isStudent = req.params.studentOrInstructor == 'student';
        var modelClass = model[isStudent ? 'Student' : 'Instructor'];
        modelClass.authenticate(loginID, password, function (entity)
        {
            if (entity)
            {
                req.session[isStudent ? 'studentID' : 'instructorID'] = entity.id;
                res.send("logged in");
            }
            else
            {
                res.send(403);
            }
        });
    });
    
    app.get(rootPath + '/instructor', function (req, res)
    {
        req.instructor.getStudents().on('success', function (students)
        {
            res.render('instructor', {
                mainjs: 'clientinstructor',
                instructorID: req.instructor.loginID,
                students: students
            });
        });
    });
    
    app.post(rootPath + '/instructor/student', function (req, res)
    {
        console.log('Creating new student with parameters:');
        console.log(req.body);
        var student = model.Student.build(req.body);
        var chainer = new Sequelize.Utils.QueryChainer();
        chainer.add(student.setInstructor(req.instructor));
        chainer.add(student.save());
        chainer.run().on('success', function ()
        {
            res.send({
                student: student.toJSON()
            });
        });
    });
    
    app.get(rootPath + '/logout', function (req, res)
    {
        req.session.destroy();
        res.redirect('home');
    });
    
    // The REST API handler.
    app.use(rootPath, restapi(gc));
    
    // Start the server.
    app.listen(port);
    console.log('Test harness server running on port ' + port + ' with URL root ' + rootPath);
}

if (require.main === module)
{
    if (process.argv.length != 5)
    {
        console.log('Invalid argument(s).');
        console.log('Usage: node example.js PORT ROOT OUTPUT');
        console.log('PORT is the server port (e.g. 80)');
        console.log('ROOT is the server URL root path (e.g. "/fluencydemo")');
        console.log('OUTPUT is the file output directory path, which must be writable.');
        process.exit(1);
    }
    var port = parseInt(process.argv[2]);
    var root = process.argv[3];
    var output = process.argv[4];
    model.init(false, function ()
    {
        runServer(port, root, output);
    });
}
