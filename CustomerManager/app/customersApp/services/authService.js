'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', 'Backand'];

    var authFactory = function ($http, $rootScope, Backand) {
        var factory = {
                loginPath: '/login',
                user: {
                    isAuthenticated: (Backand.getToken() != ''),
                    roles: null
                }
            };

        factory.login = function (email, password) {
            return Backand.signin(email, password).then(
                function (results) {
                    var loggedIn = (results.access_token != '');
                    changeAuth(loggedIn);
                    return loggedIn;
                });
        };

        factory.logout = function () {
            return Backand.signout().then(
                function (results) {
                    var loggedIn = !results;
                    changeAuth(loggedIn);
                    return loggedIn;
                });
        };

        factory.redirectToLogin = function () {
            $rootScope.$broadcast('redirectToLogin', null);
        };

        function changeAuth(loggedIn) {
            factory.user.isAuthenticated = loggedIn;
            $rootScope.$broadcast('loginStatusChanged', loggedIn);
        }

        return factory;
    };

    authFactory.$inject = injectParams;

    app.factory('authService', authFactory);

});
