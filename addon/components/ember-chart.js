import Ember from 'ember';
import ChartDataUpdater from 'ember-cli-chart/chart-data-updater';
/* global Chart */

export default Ember.Component.extend({
  tagName: 'canvas',
  attributeBindings: ['width', 'height'],

  didInsertElement: function(){
    var context = this.get('element').getContext('2d');
    var collection = this.get('collection');
    var dataAttr = this.get('attribute');
    var labelAttr = this.get('label')
    
    var data = this.get('collection').mapBy(dataAttr);
    
    var type = Ember.String.classify(this.get('type'));
    var options = Ember.merge({}, this.get('options'));

    var chart = new Chart(context)[type](data, options);

    if (this.get('legend')) {
      var legend = chart.generateLegend();
      this.$().wrap("<div class='chart-parent'></div>");
      this.$().parent().append(legend);
    }

    this.set('chart', chart);
    this.addObserver('data', this, this.updateChart);
    this.addObserver('data.[]', this, this.updateChart);
    this.addObserver('options', this, this.updateChart);
  },

  willDestroyElement: function(){
    if (this.get('legend')) {
      this.$().parent().children('[class$=legend]').remove();
    }

    this.get('chart').destroy();
    this.removeObserver('data', this, this.updateChart);
    this.removeObserver('data.[]', this, this.updateChart);
    this.removeObserver('options', this, this.updateChart);
  },

  updateChart: function(){
    var chart = this.get('chart');
    var collection = this.get('collection');
    var dataAttr = this.get('attribute');
    var labelAttr = this.get('label')
    
    var data = this.get('collection').mapBy(dataAttr);
    
    var redraw = ChartDataUpdater.create({
      data: data,
      chart: chart
    }).updateByType();

    if (redraw) {
      this.willDestroyElement();
      this.didInsertElement();
    } else {
      chart.update();
    }
    
    if (this.get('legend')) {
      this.$().parent().children('[class$=legend]').remove();
      var legend = chart.generateLegend();
      this.$().parent().append(legend);
    }
  }
});
