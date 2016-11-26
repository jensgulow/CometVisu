////////// Reflection API for possible Editor communication: Start //////////

/**
 * @class cv.io.Reflection
 */
qx.Class.define('cv.io.Reflection', {
  extend: cv.Object,
  type: "static",

  /*
  ******************************************************
    STATICS
  ******************************************************
  */
  statics: {
    /**
     * Return a list of all widgets.
     */
    list: function () {
      var widgetTree = {};
      qx.bom.Selector.query('.page').forEach(function (elem) {
        var id = qx.bom.element.Attribute.get(elem, "id").split('_');
        var thisEntry = widgetTree;
        if ('id' === id.shift()) {
          var thisNumber;
          while (thisNumber = id.shift()) {
            if (!(thisNumber in thisEntry))
              thisEntry[thisNumber] = {};

            thisEntry = thisEntry[thisNumber];
          }
          qx.bom.Selector.matches('div.widget_container', qx.dom.Hierarchy.getDescendants(elem)).forEach(function(widget, i) {
            if (undefined === thisEntry[i]) {
              thisEntry[i] = {}
            }
            var thisWidget = cv.structure.WidgetFactory.getInstanceByElement(widget);
            thisEntry[i].name = widget.classname;
            thisEntry[i].type = widget.get$$type();
          });
        }
      });
      return widgetTree;
    },

    /**
     * Return all attributes of a widget.
     */
    read: function (path) {
      var widget = this.lookupWidget(path),
        data = qx.lang.Object.mergeWith({}, cv.data.Model.getInstance().getWidgetDataByElement(widget)); // copy
      delete data.basicvalue;
      delete data.value;
      return data;
    },

    /**
     * Set the selection state of a widget.
     */
    select: function (path, state) {
      var container = this.lookupWidget(path);
      if (state)
        qx.bom.element.Class.set(container, 'selected');
      else
        qx.bom.element.Class.remove(container, 'selected');
    },

    /**
     * Set all attributes of a widget.
     */
    write: function (path, attributes) {
      qx.bom.element.Dataset.setData(qx.dom.Hierarchy.getChildElements(this.lookupWidget(path))[0], attributes);
    },

    /**
     * Reflection API: communication
     * Handle messages that might be sent by the editor
     */
    handleMessage: function (event) {
      // prevend bad or even illegal requests
      if (event.origin !== window.location.origin ||
        'object' !== typeof event.data || !('command' in event.data ) || !('parameters' in event.data )
      )
        return;

      var answer = 'bad command',
        parameters = event.data.parameters;

      // note: as the commands are from external, we have to be a bit more
      //       carefull for corectness testing
      switch (event.data.command) {
        case 'create':
          if ('object' === typeof parameters &&
            pathRegEx.test(parameters.path) &&
            'string' === typeof parameters.element
          )
            answer = thisTemplateEngine.create(parameters.path, parameters.element);
          else
            answer = 'bad path or element';
          break;

        case 'delete':
          if (pathRegEx.test(parameters))
            answer = thisTemplateEngine.deleteCommand(parameters);
          else
            answer = 'bad path';
          break;

        case 'focus':
          if (pathRegEx.test(parameters))
            answer = thisTemplateEngine.focus(parameters);
          else
            answer = 'bad path';
          break;

        case 'list':
          answer = thisTemplateEngine.list();
          break;

        case 'read':
          if (pathRegEx.test(parameters))
            answer = thisTemplateEngine.read(parameters);
          else
            answer = 'bad path';
          break;

        case 'select':
          if ('object' === typeof parameters &&
            pathRegEx.test(parameters.path) &&
            'boolean' === typeof parameters.state
          )
            answer = thisTemplateEngine.select(parameters.path, parameters.state);
          break;

        case 'write':
          if ('object' === typeof parameters &&
            pathRegEx.test(parameters.path) &&
            'object' === typeof parameters.attributes
          )
            answer = thisTemplateEngine.write(parameters.path, parameters.attributes);
          break;
      }

      event.source.postMessage(answer, event.origin);
    }
  },

  defer: function() {
    window.addEventListener('message', cv.io.Reflection.handleMessage, false);
  }
});

////////// Reflection API for possible Editor communication: End //////////