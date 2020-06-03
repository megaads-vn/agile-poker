system.controller("TeamController", TeamController);
function TeamController($scope, $http, $rootScope, io, $timeout) {
    $scope.tasks = [];
    $scope.username = "";
    var self = this;
    this.__proto__ = new BaseController($scope, $http, $rootScope);
    this.init = function () {
        $scope.addTask();

        /* ----------------- */

        document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            const keyCode = event.code;
            const which = event.which;

            /* if(document.activeElement.tagName == 'INPUT')
                return; */

            switch (which) {
                case 187: //'Equal'
                    $timeout(function () {
                        $scope.addTask();
                    })
                    break;

                case 189: //'Minus'
                    $timeout(function () {
                        $scope.removeTask();
                    })
                    break;

                default:
                    break;
            }

            // console.log(`Key pressed ${keyName} / ${keyCode}`, event);
        }, false);

    };
    $scope.addTask = function () {
        $scope.tasks.push({
            value: 0,
            childs: []
        });
        setTimeout(function () {
            $(".estimated-value").last().focus();
            $(".estimated-value").last().select();
        }, 100);
    };
    $scope.removeTask = function () {
        if ($scope.tasks.length > 1) {
            $scope.tasks.splice(-1, 1);
        }
    };
    $scope.submit = function () {
        if ($scope.username == null || $scope.username == "") {
            var username = prompt("Please enter your name", "");
            if (username != null && username != "") {
                $scope.username = username
            }
        }
        if ($scope.username != null && $scope.username != "") {
            self.emitData();
            alert("Thank " + $scope.username + " for your submitting");
        }
    };
    $scope.calculateEstimatedTime = function () {
        var retval = 0;
        for (var i = 0; i < $scope.tasks.length; i++) {
            if (typeof $scope.tasks[i].value !== 'undefined' && $scope.tasks[i].value != null) {
                retval += $scope.tasks[i].value;
            }
        }
        return retval;
    };

    $scope.addChildTask = function (task, index) {
        task.childs.push({
            value: 0
        });

        $timeout(function () {

            let lastInput = $(".estimated-value").filter(function () {
                return $(this).data("parentId") == index;
            }).last();

            lastInput.focus();
            lastInput.select();

        });
    };

    $scope.removeChildTask = function (task, index) {
        task.childs.splice(-1, 1);

        $timeout(function () {

            let lastInput = $(".estimated-value").filter(function () {
                return $(this).data("parentId") == index;
            }).last();

            lastInput.focus();
            lastInput.select();

        });
    };

    $scope.changeChildValue = function (task) {
        var totalValue = 0;
        task.childs.forEach(function (child) {
            if (child.value != null) {
                totalValue += child.value;
            }
        });
        task.value = totalValue;
    };

    this.emitData = function () {
        io.emit("team.submit", {
            username: $scope.username,
            tasks: $scope.tasks
        });
    }
    this.init();
}
