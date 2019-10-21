module.exports = HomeController;

var packageCfg = require(__dir + "/package.json");

function HomeController($config, $event, $logger, $ioConnection) {
    var self = this;
    var tasks = {};
    var final = {};
    this.index = function(io) {
        var title = "Agile Poker";
        io.render("index");
    };
    this.team = function(io) {
        var title = "Team | Agile Poker";
        io.render("team", self.buildHttpRespondData({
            title: title
        }));
    };
    this.master = function(io) {
        var title = "Master | Agile Poker";
        io.render("master", self.buildHttpRespondData({
            title: title
        }));
    };
    this.refresh = function(io) {
        tasks = {};
        final = {};
        $ioConnection.broadcastMessage("master.fetch", tasks);
        $ioConnection.broadcastMessage("master.final", final);
        io.render("index");
    };
    this.buildHttpRespondData = function(data) {
        data.host = $config.get("app.host", "localhost");
        data.port = $config.get("app.port", "2307");
        data.version = packageCfg.version;
        return data;
    };
    this.submit = function(io) {
        $logger.debug("on submit: ", io.inputs);
        var task = {
            username: io.inputs.username,
            tasks: io.inputs.tasks
        };
        tasks[io.inputs.username] = io.inputs.tasks;
        $ioConnection.broadcastMessage("team.submit", task);
    };
    this.fetch = function(io) {
        $logger.debug("on fetch: ", tasks);
        io.json(tasks);
    };
    this.final = function(io) {
        if ( io.inputs.length != 0) {
            final = io.inputs;
        }
        $logger.debug("on final: ", final);
        $ioConnection.broadcastMessage("master.final", final);
    };

    this.getData = function (io) {
        io.json(final);
    }
}
