var system = angular.module("system", []);
system.factory('io', function ($rootScope) {
    var socket = io("http://" + host + ":" + port);
    return socket;
});
system.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
        });
    };
});
