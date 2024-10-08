system.controller("MasterController", MasterController);
function MasterController($scope, $http, $rootScope, io) {
    $scope.tasks = {};
    $scope.username = "";
    var self = this;
    $scope.showAutoFill = false;
    this.__proto__ = new BaseController($scope, $http, $rootScope);
    this.init = function() {
        io.on('team.submit', function (data) {
            $scope.$apply(function () {
                $scope.tasks[data.username] = data.tasks;
            });
        });
        io.on('master.fetch', function (data) {
            $scope.$apply(function () {
                $scope.tasks = data;
                $scope.final = {};
            });
        });
        io.on('master.final', function (data) {
            $scope.$apply(function () {
                $scope.final = data;
            });
        });
        io.emit("master.fetch", {});
        io.emit("master.final", []);

        io.on('master.update.task', function (data) {
            try {
                $scope.$apply(function () {
                    $scope.tasks[data.username][data.index] = data.task;
                });
                
            } catch (error) {
                console.error('Error on update task!');
            }
           
        });
        
    };
    $scope.final = {};
    $scope.getTaskCount = function() {
        var retval = 0;
        const userObj = Object.keys($scope.tasks);
        $scope.showAutoFill = false;
        if (userObj.length == 1) {
            $scope.showAutoFill = true;
        }
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

    $scope.getChilds = function (key) {
        var listChild = [];
        var retVal = [];
        for (var username in $scope.tasks) {
            for (var task in $scope.tasks[username]) {
                if (typeof listChild[task] == 'undefined') {
                    listChild[task] = 0;
                }
                if (listChild[task] < $scope.tasks[username][task].childs.length){
                    listChild[task] = $scope.tasks[username][task].childs.length;
                }
            }
        }
        for (var index in listChild) {
            retVal[index] = [];
            for (var i = 1; i <= listChild[index]; i++) {
                retVal[index].push(i);
            }
        }
        return retVal[key];
    };

    $scope.getAvgEstimatedValue = function(taskIdx, indexChild) {
        var retval = 0;
        var sum = 0;
        var count = 0;
        if (typeof indexChild == 'undefined') {
            for (var username in $scope.tasks) {
                if ($scope.tasks[username].length - 1 >= taskIdx) {
                    if (typeof $scope.tasks[username][taskIdx].value != 'undefined' && !$scope.tasks[username][taskIdx].isDisable) {
                        sum += $scope.tasks[username][taskIdx].value;
                        count ++;
                    }
                }
            }
            if (count > 0) {
                retval = sum / count;
            }

        } else {
            for (var username in $scope.tasks) {
                if ($scope.tasks[username].length - 1 >= taskIdx && $scope.tasks[username][taskIdx].childs.length - 1 >= indexChild) {
                    if (typeof $scope.tasks[username][taskIdx].childs[indexChild].value != 'undefined' && !$scope.tasks[username][taskIdx].childs[indexChild].isDisable) {
                        sum += $scope.tasks[username][taskIdx].childs[indexChild].value;
                        count ++;
                    }
                }
            }
            if (count > 0) {
                retval = sum / count;
            }
        }
        return Math.round(retval * 10) / 10;
    }

    $scope.getMaxEstimatedValue = function(taskIdx, indexChild) {
        var retval = 0;
        if (typeof indexChild == 'undefined') {
            for (var username in $scope.tasks) {
                if ($scope.tasks[username].length - 1 >= taskIdx) {
                    if (typeof $scope.tasks[username][taskIdx].value != 'undefined' && $scope.tasks[username][taskIdx].value >= retval && !$scope.tasks[username][taskIdx].isDisable) {
                        retval = $scope.tasks[username][taskIdx].value;
                    }
                }
            }
        } else {
            for (var username in $scope.tasks) {
                if ($scope.tasks[username].length - 1 >= taskIdx && $scope.tasks[username][taskIdx].childs.length - 1 >= indexChild) {
                    if (typeof $scope.tasks[username][taskIdx].childs[indexChild].value != 'undefined' && $scope.tasks[username][taskIdx].childs[indexChild].value >= retval && !$scope.tasks[username][taskIdx].childs[indexChild].isDisable) {
                        retval = $scope.tasks[username][taskIdx].childs[indexChild].value;
                    }
                }
            }
        }

        return retval;
    };

    $scope.getMinEstimatedValue = function(taskIdx, indexChild) {
        var retval = 100000;
        if (typeof indexChild == 'undefined') {
            for (var username in $scope.tasks) {
                if ($scope.tasks[username].length - 1 >= taskIdx) {
                    if (typeof $scope.tasks[username][taskIdx].value != 'undefined' && $scope.tasks[username][taskIdx].value < retval && !$scope.tasks[username][taskIdx].isDisable) {
                        retval = $scope.tasks[username][taskIdx].value;
                    }
                }
            }
        } else {
            for (var username in $scope.tasks) {
                if ($scope.tasks[username].length - 1 >= taskIdx && $scope.tasks[username][taskIdx].childs.length - 1 >= indexChild) {
                    if (typeof $scope.tasks[username][taskIdx].childs[indexChild].value != 'undefined' && $scope.tasks[username][taskIdx].childs[indexChild].value < retval && !$scope.tasks[username][taskIdx].childs[indexChild].isDisable) {
                        retval = $scope.tasks[username][taskIdx].childs[indexChild].value;
                    }
                }
            }
        }

        if(retval == 100000)
            retval = 0;

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

    $scope.getTotalMistake = function() {
        var retval = [];
        var idx = 0;
        for (var username in $scope.tasks) {
            var sum = 0;
            for (var i = 0; i < $scope.tasks[username].length; i++) {
                if ($scope.tasks[username][i].childs.length == 0) {
                    if (typeof $scope.tasks[username][i].value != 'undefined' && typeof $scope.final[i] != 'undefined' && $scope.final[i] != null) {
                        sum += Math.abs($scope.tasks[username][i].value - $scope.final[i]);
                    }
                } else {
                    for (var k in $scope.tasks[username][i].childs) {
                        if (typeof $scope.final[i + '-' + k] != 'undefined' && $scope.final[i + '-' + k] != null) {
                            if (typeof $scope.tasks[username][i].childs[k].value != 'undefined') {
                                sum += Math.abs($scope.tasks[username][i].childs[k].value - $scope.final[i + '-' + k]);
                            } else {
                                sum += $scope.final[i + '-' + k];
                            }
                        }
                    }
                }
            }
            retval[idx] = sum;
            idx ++;
        }
        return retval;
    };

    $scope.sendFinal = function(){
        io.emit('master.final', $scope.final);
    }

    $scope.updateTask = function(data){
        io.emit('master.update', data);
    }

    $scope.getTotalFinal = function() {
       
        var retval = 0;
        angular.forEach($scope.final, function(value, key) {
            if (key.indexOf('-') == -1) {
                retval += value;
            }
        });
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

    $scope.getOffset = function(a, b){
        var retval = "";
        if(a != null){
            retval = Math.abs(parseFloat(a) - parseFloat(b));
        }
        return retval;
    }
    $scope.checkMaxOffset = function(username, index, indexChild){
        if (typeof indexChild == 'undefined') {
            var final = $scope.final[index] || -1;
            if (final == -1) {
                return false;
            }
            var max = $scope.getOffset($scope.tasks[username][index].value, final);
            for (var usernameTmp in $scope.tasks) {
                if ($scope.getOffset(typeof $scope.tasks[usernameTmp][index] != "undefined" && $scope.tasks[usernameTmp][index].value, final) > max) {
                    return false;
                }
            }
            return true;
        } else {
            var final = $scope.final[index + '-' + indexChild] || -1;
            if (final == -1) {
                return false;
            }
            if (typeof $scope.tasks[username][index].childs[indexChild] == 'undefined') {
                return false;
            }
            var max = $scope.getOffset($scope.tasks[username][index].childs[indexChild].value, final);
            for (var usernameTmp in $scope.tasks) {
                if (typeof $scope.tasks[usernameTmp][index] != "undefined" && typeof $scope.tasks[usernameTmp][index].childs[indexChild] != 'undefined' && $scope.getOffset($scope.tasks[usernameTmp][index].childs[indexChild].value , final) > max) {
                    return false;
                }
            }
            return true;
        }
    }
    $scope.checkMinOffset = function(username, index, indexChild){
        if (typeof indexChild == 'undefined') {
            var final = $scope.final[index] || -1;
            if(final == -1){
                return false;
            }
            var min = $scope.getOffset($scope.tasks[username][index].value, final);
            for (var usernameTmp in $scope.tasks) {
                if(typeof $scope.tasks[usernameTmp][index] != "undefined"&& $scope.getOffset($scope.tasks[usernameTmp][index].value ,  final)< min){
                    return false;
                }
            }
            return true;
        } else {
            var final = $scope.final[index + '-' + indexChild] || -1;
            if(final == -1){
                return false;
            }
            if (typeof $scope.tasks[username][index].childs[indexChild] == 'undefined') {
                return false;
            }
            var min = $scope.getOffset($scope.tasks[username][index].childs[indexChild].value, final);
            for (var usernameTmp in $scope.tasks) {
                if(typeof $scope.tasks[usernameTmp][index] != "undefined" && typeof $scope.tasks[usernameTmp][index].childs[indexChild] != 'undefined' && $scope.getOffset($scope.tasks[usernameTmp][index].childs[indexChild].value , final) < min){
                    return false;
                }
            }
            return true;
        }

    }

    $scope.rebuildFinal = function (index, childs) {
        var sumFinal = 0;
        for (var child in childs) {
            if (typeof $scope.final[index + '-' + child] != 'undefined') {
                sumFinal += $scope.final[index + '-' + child];
            }
        }
        $scope.final[index] = sumFinal;
    };

    $scope.toogleIgnore = function(username, index) {
        $scope.tasks[username][index].isDisable = !$scope.tasks[username][index].isDisable;
        $scope.updateTask({
            username, 
            index, 
            task: $scope.tasks[username][index]
        });
    }

    $scope.toogleIgnoreChild = function(username, grandparentIndex, parentIndex) {
        $scope.tasks[username][grandparentIndex].childs[parentIndex].isDisable = !$scope.tasks[username][grandparentIndex].childs[parentIndex].isDisable;
        $scope.updateTask({
            username, 
            index: grandparentIndex, 
            task: $scope.tasks[username][grandparentIndex]
        });
    }

    $scope.checkAmazingTaskChild = function(grandparentIndex, parentIndex) {
        let users = $scope.getUsernames();
        let frequencyEstimated = {};
        let estimatedValue = [];

        users.forEach(function(username) {
            let rowTask = $scope.tasks[username][grandparentIndex].childs[parentIndex];
            if(typeof rowTask != 'undefined' && rowTask) {
                if(!frequencyEstimated[rowTask.value]){
                    frequencyEstimated[rowTask.value] = 0;
                }
                frequencyEstimated[rowTask.value] ++; 
                estimatedValue.push(rowTask.value)
            }

            estimatedValue.push(rowTask)
        })

        let countFrequencyEstimated = 0;
        for (let k in frequencyEstimated) {
            if (frequencyEstimated.hasOwnProperty(k)) {
               ++ countFrequencyEstimated;
            }
        }

        if(countFrequencyEstimated <= 2) {
            return true
        }

        return false;

    }

    $scope.checkAmazingTask = function(index) {
        let users = $scope.getUsernames();
        let frequencyEstimated = {};
        let estimatedValue = [];
        users.forEach(function(username) {
            let rowTask = $scope.tasks[username][index];
            if(typeof rowTask != 'undefined' && rowTask) {
                if(!frequencyEstimated[rowTask.value]){
                    frequencyEstimated[rowTask.value] = 0;
                }
                frequencyEstimated[rowTask.value] ++; 
                estimatedValue.push(rowTask.value)
            }
        })

        let countFrequencyEstimated = 0;
        for (let k in frequencyEstimated) {
            if (frequencyEstimated.hasOwnProperty(k)) {
               ++ countFrequencyEstimated;
            }
        }

        if(countFrequencyEstimated <= 2) {
            return true
        }

        return false;

    }

    $scope.autoFill = function() {
        console.log('Auto Fill Clicked');
        const objKeys = Object.keys($scope.tasks);
        let tasks = $scope.tasks[objKeys[0]];
        for (const idx in tasks) {
            if (tasks[idx].childs.length <= 0) {
                $scope.final[idx] = tasks[idx].value;
            } else {
                let parentTotal = 0;
                for (const childIdx in tasks[idx].childs) {
                    parentTotal += tasks[idx].childs[childIdx].value;
                    $scope.final[idx + '-' + childIdx] = tasks[idx].childs[childIdx].value;
                }
                $scope.final[idx] = parentTotal;
            }
        }
    }

    this.init();
}
