'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$q', 'Backand'];

    var customersFactory = function ($http, $q, Backand) {
        var serviceBase = Backand.getApiUrl() + '/1/objects/',
            factory = {};

        factory.getCustomers = function (pageIndex, pageSize) {
            return getPagedResource('customers?deep=true', pageIndex, pageSize);
        };

        factory.getCustomersSummary = function (pageIndex, pageSize) {
            return getPagedResource('customers', pageIndex, pageSize);
        };

        factory.getStates = function () {
            return $http.get(serviceBase + 'states?pageSize=100').then(
                function (results) {
                    return results.data.data;
                });
        };

        factory.checkUniqueValue = function (id, property, value) {
            if (!id) id = 0;
            return $http ({
              method: 'GET',
              url: serviceBase + 'customers',
              params: {
                pageSize: 1,
                pageNumber: 1,
                filter: [
                  {
                    fieldName: property,
                    operator: 'equals',
                    value: escape(value)
                  }
                ],
                sort: ''
              }
            }).then(
                function (results) {
                    return (results.data.data.length == 0);
                });
        };

        factory.insertCustomer = function (customer) {
            return $http.post(serviceBase + 'customers', customer).then(function (results) {
                customer.id = results.data.id;
                return results.data;
            });
        };

        factory.newCustomer = function () {
            return $q.when({ id: 0 });
        };

        factory.updateCustomer = function (customer) {
            return $http.put(serviceBase + 'customers/' + customer.id, customer).then(function (status) {
                return status.data;
            });
        };

        factory.deleteCustomer = function (id) {
            return $http.delete(serviceBase + 'customers/' + id).then(function (status) {
                return status.data;
            });
        };

        factory.getCustomer = function (id, deep) {
            //then does not unwrap data so must go through .data property
            //success unwraps data automatically (no need to call .data property)
          return $http ({
              method: 'GET',
              url: serviceBase + 'customers/' + id + '?deep=' + String(deep),
              params: {
                pageSize: 100,
                pageNumber: 1,
                filter: null,
                sort: ''
              }
          }).then(function (results) {
              var cust = results.data;
              extendCustomers([cust]);
              return cust;
          });
        };

        function extendCustomers(customers) {
            var custsLen = customers.length;
            //Iterate through customers
            for (var i = 0; i < custsLen; i++) {
                var cust = customers[i];
                if (!cust.orders) continue;

                var ordersLen = cust.orders.length;
                for (var j = 0; j < ordersLen; j++) {
                    var order = cust.orders[j];
                    order.orderTotal = order.quantity * order.price;
                }
                cust.ordersTotal = ordersTotal(cust);
            }
        }

        function getPagedResource(baseResource, pageIndex, pageSize) {
            return $http ({
                method: 'GET',
                url: serviceBase + baseResource,
                params: {
                  pageSize: pageSize,
                  pageNumber: pageIndex+1,
                  filter: null,
                  sort: ''
                }
            }).then(function(response){
                var custs = response.data.data;
                //extendCustomers(custs); //todo: need to replace with a query in the server
                return {
                    totalRecords: response.data.totalRows,
                    results: custs
                };
            });
        }


        // is this still used???
        function orderTotal(order) {
            return order.quantity * order.price;
        };

        function ordersTotal(customer) {
            var total = 0;
            var orders = customer.orders;
            var count = orders.length;

            for (var i = 0; i < count; i++) {
                total += orders[i].orderTotal;
            }
            return total;
        };

        return factory;
    };

    customersFactory.$inject = injectParams;

    app.factory('customersService', customersFactory);

});