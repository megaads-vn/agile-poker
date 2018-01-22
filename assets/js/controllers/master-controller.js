system.controller("MasterController", MasterController);
function MasterController($scope, $http, $rootScope, io) {
    $scope.tasks = {};
    $scope.username = "";
    var self = this;
    this.__proto__ = new BaseController($scope, $http, $rootScope);
    this.init = function() {
        io.on('team.submit', function (data) {
            $scope.$apply(function () {
                $scope.tasks[data.username] = data.tasks;
                console.log("getTaskCount", $scope.getTaskCount());
                console.log("getUserCount", $scope.getUserCount());
            });
        });
        io.on('master.fetch', function (data) {
            $scope.$apply(function () {
                $scope.tasks = data.tasks;
                console.log("getTaskCount", $scope.getTaskCount());
                console.log("getUserCount", $scope.getUserCount());
            });
        });
        io.emit("master.fetch", {});
    };
    $scope.getTaskCount = function() {
        var retval = 0;
        for (var username in $scope.tasks) {
            if (retval < $scope.tasks[username].length) {
                retval = $scope.tasks[username].length;
            }
        }
        return retval;
    };
    $scope.getTasks = function() {
        var retval = [];
        var taskCount = $scope.getTaskCount();
        for (var i = 1; i <= taskCount; i++) {
            retval.push(i);
        }
        return retval;
    };
    $scope.getAvgEstimatedValue = function(taskIdx) {
        var retval = 0;
        var sum = 0;
        var count = 0;
        for (var username in $scope.tasks) {
            if ($scope.tasks[username].length - 1 >= taskIdx) {
                if (typeof $scope.tasks[username][taskIdx].value != 'undefined') {
                    sum += $scope.tasks[username][taskIdx].value;
                    count ++;
                }
            }
        }
        if (count > 0) {
            retval = sum / count;
        }
        return retval;
    }
    $scope.getMaxEstimatedValue = function(taskIdx) {
        var retval = 0.1;
        for (var username in $scope.tasks) {
            if ($scope.tasks[username].length - 1 >= taskIdx) {
                if (typeof $scope.tasks[username][taskIdx].value != 'undefined' && $scope.tasks[username][taskIdx].value > retval) {
                    retval = $scope.tasks[username][taskIdx].value;
                }
            }
        }
        return retval;
    }
    $scope.getMinEstimatedValue = function(taskIdx) {
        var retval = 100000;
        for (var username in $scope.tasks) {
            if ($scope.tasks[username].length - 1 >= taskIdx) {
                if (typeof $scope.tasks[username][taskIdx].value != 'undefined' && $scope.tasks[username][taskIdx].value < retval) {
                    retval = $scope.tasks[username][taskIdx].value;
                }
            }
        }
        return retval;
    }
    $scope.getTotalEstimatedValues = function() {
        var retval = [];
        var idx = 0;
        for (var username in $scope.tasks) {
            var sum = 0;
            for (var i = 0; i < $scope.tasks[username].length; i++) {
                if (typeof $scope.tasks[username][i].value != 'undefined') {
                    sum += $scope.tasks[username][i].value;
                }
            }
            retval[idx] = sum;
            idx ++;
        }
        return retval;
    };
    $scope.getUserCount = function() {
        var retval = 0;
        for (var username in $scope.tasks) {
            retval ++;
        }
        return retval;
    };
    $scope.getUsernames = function() {
        var retval = [];
        for (var username in $scope.tasks) {
            retval.push(username);
        }
        return retval;
    };
    this.init();
}
