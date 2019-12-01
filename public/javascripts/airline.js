var app = angular.module('Airline', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'templates/index.html',
            controller: 'indexController'
        })

        .when('/register', {
        	templateUrl: 'templates/register.html',
        	controller: 'registerController'
        })
        .when('/login', {
        	templateUrl: 'templates/login.html',
        	controller: 'loginController'
        })
		.when('/flights', {
            templateUrl: 'templates/flights.html',
            controller: 'showFlightsController'
		})
		.when('/flights/form', {
            templateUrl: 'templates/flight-form.html',
            controller: 'addFlightController'
		})
		.when('/flights/edit/:id', {
            templateUrl: 'templates/flight-edit.html',
            controller: 'editFlightController'
		})
		.when('/flights/delete/:id', {
            templateUrl: 'templates/flight-delete.html',
            controller: 'deleteFlightController'
		})
        .when('/search', {
            templateUrl: 'templates/search.html',
            controller: 'searchController'
        })
        .when('/reservations/:id', {
            templateUrl: 'templates/reservations.html',
            controller: 'showReservationsController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('indexController',['$location','$scope',
    function($location, $scope) {
        if (sessionStorage.getItem('user') != null) {
            $scope.signout = true;
            $scope.accountHref = '#/reservations/' + sessionStorage.getItem('user');
            $scope.loginName = 'Welcome! ' + sessionStorage.getItem('user');
            if (sessionStorage.getItem('auth') == 0) {
                $scope.admin = true;
            }
        } else {
            $scope.signout = false;
            $scope.accountHref = '/#/login';
            $scope.loginName = 'Log In';
        }
        $scope.signOut = function () {
            sessionStorage.clear();
            location.reload();
        }
    }]);

app.controller('registerController', ['$scope', '$resource', '$location',
    function($scope, $resource) {
        if (sessionStorage.getItem('user') != null) {
            self.location = '#/';
            return ;
        }

        $scope.usernameValidation = function() {
            const reg = /^[0-9a-zA-Z]+$/;
            const usedUsername = $resource('users/username/:username');
            let available = false;

            usedUsername.get({username: $scope.username}, function(user) {
                if (user.existed) {
                    available = false;
                } else {
                    available = true;
                }
                if (reg.test($scope.username) && available){
                    $scope.usernameMessage = false
                } else {
                    $scope.usernameMessage = true
                }
            });
        };

        $scope.passwordValidation = function() {
            const reg = /^[0-9a-zA-Z]{6,}$/;
            if (reg.test($scope.password)){
                $scope.passwordMessage = false
            } else {
                $scope.passwordMessage = true
            }
        };

        $scope.emailValidation = function() {
            const reg = /^[0-9a-zA-Z]+@[0-9a-zA-Z]+\.[0-9a-zA-Z]{3}$/;
            if (reg.test($scope.email)){
                $scope.emailMessage = false
            } else {
                $scope.emailMessage = true
            }
        };

        $scope.phoneValidation = function() {
            const reg = /^[0-9]{10}$/;
            if (reg.test($scope.phone)){
                $scope.phoneMessage = false
            } else {
                $scope.phoneMessage = true
            }
        };

        $scope.registerUser = function () {
            if (!($scope.username == null || $scope.password == null
                || $scope.email == null || $scope.usernameMessage
                || $scope.passwordMessage || $scope.emailMessage)) {
                const registerUser = $resource('/users');
                registerUser.save({
                    username: $scope.username,
                    password: $scope.password,
                    email: $scope.email,
                    fullname: $scope.fullname,
                    address: $scope.address,
                    phone: $scope.phone,
                    auth: 1
                }, function (user) {
                    if (user._id != null){
                        window.alert('Register successful');
                        self.location = '#/login';
                    }
                });
            }
        }

        $scope.back = function () {
            self.location = '#/login';
        }
    }]);

app.controller('loginController',['$location', '$scope', '$resource',
    function($location, $scope, $resource) {
        if (sessionStorage.getItem('user') != null) {
            self.location = '#/';
            return;
        }

        $scope.loginUser = function() {
            const userSignIn = $resource('/users/signIn');
            userSignIn.save({username: $scope.username, password: $scope.password}, function(response) {
                if (response.status) {
                    sessionStorage.setItem('user', $scope.username);
                    sessionStorage.setItem('auth', response.auth);
                    self.location='#/';
                } else {
                    $scope.failureLogin = true;
                }
            });
        };

        $scope.register = function() {
            self.location = '#/register';
        };
    }]);

app.controller('showFlightsController',
    function($scope, $resource, $location){
        if(sessionStorage.getItem('auth') != 0){
            $location.path('/');
            return;
        }
        const Flights = $resource('/flights', {});
        Flights.query(function(flights){
            $scope.flights = flights;
        });
    });

app.controller('addFlightController', ['$scope', '$resource', '$location',
    function($scope, $resource, $location) {
        if(sessionStorage.getItem('auth') != 0) {
            $location.path('/');
            return;
        }
        $scope.save = function() {
            const Flight = $resource('/flights');
            Flight.save($scope.flight, function() {
                $location.path('/flights');
            });
        };
    }]);

app.controller('editFlightController', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams){
        if(sessionStorage.getItem('auth') != 0) {
            $location.path('/');
            return;
        }
        const Flights = $resource('/flights/:id', {id: '@_id'}, {
            update: {method: 'PUT'}
        });

        Flights.get({id: $routeParams.id}, function(flight) {
            $scope.flight = flight;
        });

        $scope.save = function() {
            Flights.update($scope.flight, function() {
                $location.path('/flights');
            });
        }
    }]);

app.controller('deleteFlightController', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams){
        if(sessionStorage.getItem('auth') != 0){
            $location.path('/')
        }

        const Flights = $resource('/flights/:id');

        Flights.get({id: $routeParams.id}, function(flight) {
            $scope.flight = flight;
        });

        $scope.delete = function() {
            Flights.delete({id: $routeParams.id}, function(status) {
                $location.path('/flights');
            });
        }
    }]);

app.controller('searchController',['$location','$scope','$resource','$filter',
    function($location, $scope, $resource, $filter) {
        if(sessionStorage.getItem('user') == null) {
            window.alert("Log In Please!")
            $location.path('/login');
        }
        $scope.username = sessionStorage.getItem('user');
        $scope.searchRooms = function() {
            const Flight = $resource('/flights/search');
            Flight.query(
                {
                    departure: $scope.departureCity,
                    arrival: $scope.arrivalCity,
                    time: $scope.date
                }, function(flights) {
                    $scope.flights = flights;
                    if(flights.length === 0) {
                        $scope.suggestion = 'Sorry, we can\'t find a plan for you for now. Try Any to find more available flights!';
                        $scope.suggestionMessage = true;
                    } else {
                        $scope.suggestionMessage = false;
                    }
            });
        };

        $scope.reserve = function (flight_id, capacity, reservedCount) {
            const peopleNumber = $scope.numberOfPeople;
            if (reservedCount + peopleNumber > capacity) {
                window.alert("Failed to reserve, not enough seats!");
                return;
            }
            const Flight = $resource('/flights/:id', {id: flight_id});
            Flight.get({}, function (flight) {
                flight.reservedCount += peopleNumber;
                if (flight.reservedCount == flight.capacity) {
                    flight.available = false;
                }
                const FlightUpdate = $resource('/flights/:id', {id: flight_id}, {
                    update: { method: 'PUT' }
                });
                FlightUpdate.update(flight, function(status) {
                });
                const Reserves = $resource('/reservations');
                Reserves.save({
                    username: sessionStorage.getItem('user'),
                    flightId: flight_id,
                    reservedCount: peopleNumber
                })
                window.alert("Reservation succeeded！");
                location.reload();
            });
        }
    }]);

app.controller('showReservationsController',
    function($scope, $resource, $location) {
        if(sessionStorage.getItem('user') == null) {
            window.alert("Log In Please!")
            $location.path('/login');
        }
        if(sessionStorage.getItem('auth') == 0) {
            const Reserves = $resource('/reservations');
            Reserves.query(function(reservations) {
                $scope.reservations = reservations;
            });
        } else {
            const Reserves = $resource('/reservations/' + sessionStorage.getItem('user'));
            Reserves.query({}, function(reservations) {
                $scope.reservations = reservations;
            });
        }
        $scope.cancel = function (reservation_id) {
                const Reserves = $resource('/reservations/:id', {id: reservation_id});
                Reserves.delete({}, function (result) {
                    location.reload();
            });
        }
    });

