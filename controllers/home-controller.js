module.exports = HomeController;

var packageCfg = require(__dir + "/package.json");

function HomeController($config, $event, $logger, $ioConnection) {
    var self = this;
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
    this.buildHttpRespondData = function(data) {
        data.host = $config.get("app.host", "localhost");
        data.port = $config.get("app.port", "2307");
        data.version = packageCfg.version;
        return data;
    };
    this.submit = function(io) {
        console.log("on submit", io.inputs);
        $ioConnection.broadcastMessage("team.submit", {
            username: io.inputs.username,
            tasks: io.inputs.tasks
        });
    };
}