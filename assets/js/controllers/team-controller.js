system.controller("TeamController", TeamController);
function TeamController($scope, $http, $rootScope, io, $timeout) {
    $scope.tasks = [];
    $scope.username = "";
    $scope.projectIds = '20';
    var self = this;
    this.__proto__ = new BaseController($scope, $http, $rootScope);
    this.init = function () {
        let splitUrl = window.location.href.split(/[?#]/);
        if (splitUrl.length > 1) {
            const params = splitUrl[1];
            if (params.includes('projects')) {
                let projectIds = params.match(/projects=[(\d+);?]+/);
                $scope.projectIds = projectIds[0].replace('projects=', '');
                
            }
        }
        $scope.addTask();
        $scope.fetchTickets();

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

    $scope.fetchTickets = function () {
        let getFilters = {
            fields: 'id,name,project_id', 
            filters: `status=waiting,project_id={${$scope.projectIds}}`,
            embeds: 'childs',
            page_size: -1
        }

        $http.get(`${ticketApi}/poker_ticket`, {
            params: getFilters})
            .then(res => {
                const data = res.data; 
                if (data.status === 'successful') {
                    $scope.tasks = data.result;
                }
            })
    }
    $scope.goTicket = function (ticketId) {
        return `${ticketSite}/ticket/${ticketId}`;
    }

    this.emitData = function () {
        io.emit("team.submit", {
            username: $scope.username,
            tasks: $scope.tasks
        });
    }
    this.init();
}
