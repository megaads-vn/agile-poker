module.exports = function ($route, $logger) {
    /** Register HTTP requests **/
    $route.get("/", "HomeController@index");
    $route.get("/team", "HomeController@team");
    $route.get("/master", "HomeController@master");
    $route.get("/refresh/j3f9sjv8so9", "HomeController@refresh");
    /** Register socket.io requests **/
    $route.io("team.submit", "HomeController@submit");
    $route.io("master.fetch", "HomeController@fetch");
    $route.io("master.final", "HomeController@final");
    /** Register filters **/
};
