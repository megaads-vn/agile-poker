module.exports = function ($route, $logger) {
    /** Register HTTP requests **/
    $route.get("/", "HomeController@index");
    $route.get("/team", "HomeController@team");
    $route.get("/master", "HomeController@master");
    /** Register socket.io requests **/
    $route.io("team.submit", "HomeController@submit");
    $route.io("master.fetch", "HomeController@fetch");
    /** Register filters **/
};
