/**
 * Search autocomplete Directive
 *
 * version 1.0.5
 * http://github.com/gus4no/angular-search-autocomplete
 *
 * by Gustavo Robles
 * gustavo.robles@crowdint.com
 */
(function(){
  'use strict';
  angular.module('SearchAutocomplete', []).directive('searchAutocomplete', function(){
    return{
      restrict: 'E',
      transclude: true,
      scope: {
        results: '=',
        placeholder: '@',
        charTreshold: '@',
        getResults: '&',
        onSelect: '&'
      },
      template: '<div class="search-autocomplete">' +
                  '<div class="search">' +
                    '<input type="text" placeholder="{{placeholder}}" data-ng-keyup="search($event)" data-ng-model="searchTerm"/>' +
                    '<span data-ng-click="resetData()">' +
                       '<i data-ng-class="{\'fa-times\': searching, \'fa-search\': !searching}" class="fa" />' +
                    '</span>' +
                  '</div>' +
                  '<div data-ng-class="{\'expanded\': showList}" data-ng-transclude="data-ng-transclude" class="results" />' +
                '</div>' +
                '<div data-ng-click="resetData()" data-ng-if="showList" class="search-autocomplete-overlay" />',
      require: '?ngModel',
      link: function(scope, element, attrs, ngModelCtrl){
        scope.$parent.select = function(row){
          if(scope.onSelect()){ scope.onSelect()(row); }
          scope.resetData();
          if(ngModelCtrl){
            scope.model = row;
            ngModelCtrl.$setViewValue(row);
            safeApply(scope);
          }
        };
      },
      controller: ['$rootScope', '$scope', function($rootScope, $scope){
        var charTreshold = parseInt($scope.charTreshold) || 3;
        var selectedItemIndex = 0;

        $scope.$watch('results', function(newValue, oldValue){
          if(newValue && newValue.length){
            $scope.showList = true;
            $scope.searched = true;
            preSelectItem(selectedItemIndex, selectedItemIndex);
          }
        });

        $scope.search = function($event){
          if($scope.searchTerm.length > 0){ $scope.searching = true; }

          if($scope.searchTerm.length == 0 || $event.keyCode == 27){
            $scope.resetData();
          }else if($scope.searchTerm.length > charTreshold) {

            var events = {
              40: moveDown,
              38: moveUp,
              13: trySelectItem,
              37: function(){},
              39: function(){}
            };

            if(events[$event.keyCode]){
              events[$event.keyCode]()
            }else{
              $scope.getResults()($scope.searchTerm);
            }
          }
        };

        $scope.resetData = function(){
          if($scope.searching || $scope.searched){
            $scope.searched = false;
            $scope.searching = false;
            $scope.showList = false;
            $scope.searchTerm = '';
            $scope.results = undefined;
            selectedItemIndex = 0;
          }
        };

        function moveDown(){
          if(selectedItemIndex < $scope.results.length - 1){
            selectedItemIndex++;
            preSelectItem(selectedItemIndex - 1, selectedItemIndex);
          }
        }

        function moveUp(){
          if(selectedItemIndex > 0){
            selectedItemIndex--;
            preSelectItem(selectedItemIndex + 1, selectedItemIndex);
          }
        }

        function trySelectItem(){
          var item = $scope.results[selectedItemIndex];
          if(item){ $scope.$parent.select(item); }
        }

        function preSelectItem(prevIndex, nextIndex){
          $scope.results[prevIndex].preSelected = false;
          $scope.results[nextIndex].preSelected = true;
          safeApply($scope);
        }

        $scope.resetData();

      }]
    }
  });

  function safeApply(scope, fn) {
    if(!(scope.$$phase || scope.$root.$$phase)){
      scope.$apply(fn);
    }
  }

})();