var express = require('express');
var session = require('express-session');
var Grant = require('grant-express');
var _ = require('lodash');
var pug = require('pug');
var SyncTasks = require('synctasks');
var WunderlistSDK = require('wunderlist');

var config = require('./config.json');

function Finito(access_token) {
    this.twentyFourHoursInMilisec = 24 * 60 * 60 * 1000;
    this.wunderlistApi = new WunderlistSDK({
        'accessToken': access_token,
        'clientID': config.wunderlist.key
    });
}

Finito.prototype.getAllLists = function() {
    return this.wunderlistApi.http.lists.all().done(lists => {
        console.log('Got ' + lists.length  + ' list(s)!');
        return lists;
    })
    .fail(() => {
        console.log('Error getting lists.');
    });
}

Finito.prototype.getAllCompletedTasksFromLists = function(lists) {
    var promises = [];
    var tasks = [];
    var promises = _.map(lists, list => {
        return this.wunderlistApi.http.tasks.forList(list.id, true /* completed */).done(completedTasks => {
            tasks.push(...completedTasks);
        }).fail(() => {
            console.log('Error getting tasks for list: ' + list.id);
        });
    });
    return SyncTasks.all(promises).then(() => {
        return tasks;
    }).fail(() => {
        console.log('Error getting tasks.');
    });
}

Finito.prototype.getCompletedInTheLastTwentyFourHours = function(tasks) {
    return _.filter(tasks, task => {
        var completedDate = new Date(task.completed_at);
        var twentyFourHoursAgoTimeStamp = Date.now() - this.twentyFourHoursInMilisec;
        return completedDate.getTime() > twentyFourHoursAgoTimeStamp;
    });
}

var app = express();
app.set('view engine', 'pug');

var grant = new Grant(require('./config.json'));
app.use(session({secret:'very secret'}));
app.use(grant);

app.get('/', function (req, res) {
    res.render('index', { title: 'Finito', header: "Login to view your completed tasks" });
});

app.get('/wunderlistCallback', function (req, res) {
    var finito = new Finito(req.query.access_token);

    finito.getAllLists().then(lists => {
        finito.getAllCompletedTasksFromLists(lists).then(tasks => {
            res.render('tasklist', { title: 'Finito', tasks: finito.getCompletedInTheLastTwentyFourHours(tasks) });
        });
    }).fail(() => {
        res.end('Something went wrong.');
    });
});

app.listen(process.env.port || 3000, function () {
    console.log('Server is running...');
});
