var system = angular.module("system", []);
system.factory('io', function ($rootScope) {
    var socket = io("http://" + host + ":" + port);
    return socket;
});
system.directive('myEnter', function ($timeout) {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {

                if (event.shiftKey) {
                    $timeout(function () {
                        scope.$apply(function () {
                            scope.addTask()
                        });
                    })

                } else {
                    $timeout(function () {
                        scope.$apply(function () {
                            scope.$eval(attrs.myEnter);
                        });
                    });
                }

                event.preventDefault();
            }
        });
    };
});

system.directive('myTab', function ($timeout) {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 32) {
                if (event.shiftKey) {
                    $timeout(function () {
                        scope.$apply(function () {
                            if(typeof element[0] != 'undefined' && element[0].dataset.parentId)
                                scope.removeChildTask(scope.e, element[0].dataset.parentId);
                        });
                    })

                } else { 
                    $timeout(function () {
                        scope.$apply(function () {
                            if(typeof element[0] != 'undefined' && element[0].dataset.parentId)
                                scope.addChildTask(scope.e, element[0].dataset.parentId);
                        });
                    });
                }

                event.preventDefault();
            }
        });
    };
});
